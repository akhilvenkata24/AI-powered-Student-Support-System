const User = require('../models/User');
const StudentQuery = require('../models/StudentQuery');
const { generateAIResponse } = require('../services/aiService');
const { analyzeSentiment } = require('../services/sentimentService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @route   POST /api/chat
 * @desc    Receive student question, get AI response, and save to DB
 * @access  Public
 */
const handleChat = async (req, res, next) => {
    try {
        const { question, language, studentId, category } = req.body;

        // 1. Identify or Create Student Profile (Identity Persistence)
        let user = await User.findOne({ 
            $or: [{ email: studentId }, { externalId: studentId }] 
        });

        if (!user) {
            user = new User({
                name: studentId.split('@')[0] || 'Student',
                email: studentId.includes('@') ? studentId : `${studentId}@campus.edu`,
                externalId: studentId
            });
            await user.save();
        }

        // 2. Intelligence & Analysis
        const sentimentResult = analyzeSentiment(question);
        let finalCategory = category || 'general';
        let aiResponse = "";

        if (sentimentResult.label === 'urgent' || sentimentResult.label === 'negative') {
            finalCategory = 'mental_health';
            aiResponse = `I hear that you are going through a difficult time. Please know you're not alone. Our campus has free counseling available 24/7. Reach out to the Wellness Center at (555) 123-4567.`;
            
            if(language !== 'English') {
                aiResponse = await generateAIResponse(`Translate this to ${language}: "${aiResponse}"`, language);
            }
        } else {
            aiResponse = await generateAIResponse(question, language);
        }

        // 3. Persist Interaction linked to User
        const newQuery = new StudentQuery({
            userId: user._id,
            question,
            aiResponse,
            category: finalCategory,
            sentiment: {
                score: sentimentResult.score,
                label: sentimentResult.label
            },
            escalatedToHuman: sentimentResult.label === 'urgent'
        });
        await newQuery.save();

        // 4. Update status in task.md (Internal logic check)
        sendSuccess(res, {
            student: { id: user.externalId, name: user.name },
            aiResponse,
            category: finalCategory,
            sentiment: sentimentResult.label,
            timestamp: new Date()
        });

    } catch (error) {
        next(error); // Pass to centralized error handler
    }
};

module.exports = { handleChat };
