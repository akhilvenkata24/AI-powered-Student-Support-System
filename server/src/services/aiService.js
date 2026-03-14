const { OpenAI } = require('openai');

/**
 * Sends a question to the AI model and returns the response.
 * @param {string} question - The student's question.
 * @param {string} language - The language to translate the response to.
 * @returns {Promise<string>} - The AI generated response.
 */
const generateAIResponse = async (question, language = 'English') => {
    const apiKey = process.env.OPENAI_API_KEY;

    // 1. Fallback for testing when no key is set or the default template key is present
    if (!apiKey || apiKey.includes('your_')) {
        console.warn("WARNING: OPENAI_API_KEY not set. Using mock response.");
        return `This is a mock AI response to: "${question}". Please configure your OpenAI API key in the .env file to get actual responses (Requested Language: ${language}).`;
    }

    // 2. Specialized handling for Groq keys vs OpenAI keys
    const isGroq = apiKey.startsWith('gsk_');
    const configuration = {
        apiKey: apiKey,
        ...(isGroq && { baseURL: "https://api.groq.com/openai/v1" })
    };

    const client = new OpenAI(configuration);

    try {
        const response = await client.chat.completions.create({
            model: isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful, empathetic, and knowledgeable college student support assistant. 
                              You assist students with admissions, academics, financial aid, campus life, and mental health resources.
                              CRITICAL INSTRUCTION: You MUST reply entirely in ${language}. Do not use any other language.`
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Service Error Details:", {
            message: error.message,
            status: error.status,
            type: error.type,
            provider: isGroq ? 'Groq' : 'OpenAI'
        });
        
        // Provide more helpful error messages to the user
        if (error.status === 401) throw new Error("Invalid API Key provided.");
        if (error.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
        
        throw new Error(`AI processing failed: ${error.message}`);
    }
};

module.exports = {
    generateAIResponse
};
