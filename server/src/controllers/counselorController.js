const { OpenAI } = require('openai');
const axios = require('axios');
const Replicate = require('replicate');
const { sendSuccess } = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const askCounselor = async (req, res, next) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, error: 'Question is required' });
        }

        // 1. Generate text response using Groq/OpenAI
        const aiResponseText = await generateCounselorResponse(question);

        // 2. Generate Audio via Google TTS (Free alternative due to ElevenLabs payment required error)
        const googleTTS = require('google-tts-api');
        
        // Google TTS returns base64 directly
        const audioBase64Raw = await googleTTS.getAudioBase64(aiResponseText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });
        
        const audioBase64 = `data:audio/mp3;base64,${audioBase64Raw}`;

        // 3. Read the avatar image from client/public/avatar.png
        const avatarPath = path.join(__dirname, '../../../../client/public/avatar.png');
        let imageBase64;
        
        if (fs.existsSync(avatarPath)) {
            const imageBuffer = fs.readFileSync(avatarPath);
            imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        } else {
            // Fallback to a placeholder URL if the user hasn't placed their image yet
            imageBase64 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400";
        }

        // 4. Generate Video via SadTalker (Local Python Flask Server)
        let videoOutput = null;
        try {
            // We assume the local Python API is running on port 5001
            const flaskRes = await axios.post('http://localhost:5001/api/render', {
                image: imageBase64,
                audio: audioBase64
            });
            videoOutput = flaskRes.data.videoUrl;
        } catch (apiError) {
            console.warn("Local SadTalker API failed. Ensure python server is running on 5001.", apiError.message);
            // We will just fall back to Audio Only on the frontend 
        }

        sendSuccess(res, {
            text: aiResponseText,
            videoUrl: videoOutput,
            audioUrl: audioBase64 // Always send the audio track just in case
        });

    } catch (error) {
        console.error("Counselor API Error:", error);
        next(error);
    }
};

const generateCounselorResponse = async (question) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const isGroq = apiKey.startsWith('gsk_');
    const configuration = {
        apiKey: apiKey,
        ...(isGroq && { baseURL: "https://api.groq.com/openai/v1" })
    };
    const client = new OpenAI(configuration);

    const response = await client.chat.completions.create({
        model: isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are a polite, helpful student counseling assistant. You answer questions about counseling slot booking, the admission process, required documents, and academic guidance. Keep your responses short, conversational, and direct. Maximum length: 1-2 short sentences.`
            },
            { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 100,
    });
    return response.choices[0].message.content;
};

module.exports = { askCounselor };
