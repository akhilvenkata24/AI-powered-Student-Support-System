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

const trimSummary = (text, maxChars = 1200) => {
    if (!text) return '';
    return text.length > maxChars ? text.slice(text.length - maxChars) : text;
};

const updateCounselorSummary = async ({ user, question, responseText, client }) => {
    const previousSummary = trimSummary(user.counselorSummary || '');
    const fallbackSummary = trimSummary(
        `${previousSummary}\nStudent: ${question}\nAssistant: ${responseText}`.trim()
    );

    try {
        const summaryCompletion = await withTimeout(
            client.chat.completions.create({
                model: process.env.OPENAI_API_KEY?.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Create a concise mental-wellbeing continuity summary for clinicians. Keep it factual, safe, and under 120 words. Include persistent concerns, tone trends, and helpful follow-up focus points. Do not include personally sensitive details beyond what is needed for support continuity.'
                    },
                    {
                        role: 'user',
                        content: `Previous summary:\n${previousSummary || 'None'}\n\nNew student message:\n${question}\n\nAssistant response:\n${responseText}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 180,
            }),
            20000,
            'Summary generation'
        );

        const generatedSummary = summaryCompletion.choices?.[0]?.message?.content?.trim();
        user.counselorSummary = trimSummary(generatedSummary || fallbackSummary);
    } catch (summaryError) {
        console.warn('Summary generation failed, using fallback summary:', summaryError.message);
        user.counselorSummary = fallbackSummary;
    }

    user.counselorSummaryUpdatedAt = new Date();
    await user.save();
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

        const apiKey = process.env.OPENAI_API_KEY;
        const isGroq = apiKey.startsWith('gsk_');
        const configuration = {
            apiKey,
            ...(isGroq && { baseURL: 'https://api.groq.com/openai/v1' })
        };
        const client = new OpenAI(configuration);

        // 1. Generate text response (60s - user is ok with delay, must succeed)
        let aiResponseText;
        try {
            aiResponseText = await withTimeout(
                generateCounselorResponse(question, user.counselorSummary, client),
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

        // 3. Update brief counselor continuity summary linked to student profile
        await updateCounselorSummary({
            user,
            question,
            responseText: aiResponseText,
            client,
        });

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

const generateCounselorResponse = async (question, previousSummary, client) => {
    const contextBlock = previousSummary
        ? `Context from prior counselor sessions (for continuity): ${trimSummary(previousSummary, 800)}`
        : 'No prior counselor session summary is available.';

    const response = await client.chat.completions.create({
        model: process.env.OPENAI_API_KEY?.startsWith('gsk_') ? 'llama-3.3-70b-versatile' : 'gpt-3.5-turbo',
        messages: [
            {
                role: "system",
                content: `You are a calm and empathetic student mental-health support assistant. Respond ONLY to mental health, emotional wellbeing, stress, anxiety, burnout, loneliness, motivation, self-care, coping, and seeking help. If asked about anything unrelated, gently redirect to mental-health support. Keep replies very short, warm, and conversational - maximum 2 short sentences. If the user mentions self-harm or immediate danger, strongly encourage contacting emergency services and a trusted person.\n\n${contextBlock}`
            },
            { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 80,
    });
    return response.choices[0].message.content;
};

module.exports = { askCounselor };
