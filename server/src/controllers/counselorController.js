const User = require('../models/User');
const { OpenAI } = require('openai');
const { sendSuccess } = require('../utils/apiResponse');

const withTimeout = async (promise, ms, label) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
};

const askCounselor = async (req, res, next) => {
    try {
        const { question, studentId } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, error: 'Question is required' });
        }

        if (!studentId) {
            return res.status(400).json({ success: false, error: 'Student ID is required' });
        }

        const normalizedId = studentId.trim().toUpperCase();
        const user = await User.findOne({ externalId: normalizedId });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Student ID not found.' });
        }

        // 1. Generate text response (60s - user is ok with delay, must succeed)
        let aiResponseText;
        try {
            aiResponseText = await withTimeout(
                generateCounselorResponse(question),
                60000,
                'LLM response'
            );
        } catch (err) {
            console.warn('LLM timeout/failure, using fallback response:', err.message);
            aiResponseText = "I hear you. Take a slow breath with me - you are not alone in this.";
        }

        // 2. Generate TTS audio via Google TTS (60s - must complete at any cost)
        const googleTTS = require('google-tts-api');
        let audioBase64 = null;
        try {
            let textToSpeak = aiResponseText;
            if (textToSpeak.length > 195) {
                const cutoff = textToSpeak.lastIndexOf(' ', 195);
                textToSpeak = (cutoff > 0 ? textToSpeak.slice(0, cutoff) : textToSpeak.slice(0, 195)) + '.';
            }
            const audioBase64Raw = await withTimeout(
                googleTTS.getAudioBase64(textToSpeak, {
                    lang: 'en',
                    slow: false,
                    host: 'https://translate.google.com',
                }),
                60000,
                'TTS generation'
            );
            audioBase64 = `data:audio/mp3;base64,${audioBase64Raw}`;
        } catch (err) {
            console.warn('TTS failure:', err.message);
        }

        sendSuccess(res, {
            text: aiResponseText,
            audioUrl: audioBase64,
            videoUrl: null
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
                content: "You are a calm and empathetic student mental-health support assistant. Respond ONLY to mental health, emotional wellbeing, stress, anxiety, burnout, loneliness, motivation, self-care, coping, and seeking help. If asked about anything unrelated, gently redirect to mental-health support. Keep replies very short, warm, and conversational - maximum 2 short sentences. If the user mentions self-harm or immediate danger, strongly encourage contacting emergency services and a trusted person."
            },
            { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 80,
    });
    return response.choices[0].message.content;
};

module.exports = { askCounselor };
