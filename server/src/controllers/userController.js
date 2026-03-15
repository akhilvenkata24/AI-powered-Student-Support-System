const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');

const getProfile = async (req, res, next) => {
    try {
        const { externalId } = req.params;
        let user = await User.findOne({ externalId });
        
        if (!user) {
            // Create a default profile if it doesn't exist (first time visitor to admissions)
            user = new User({
                externalId,
                name: 'Prospective Student',
                email: `${externalId}@placeholder.com`,
                documents: [
                    { name: 'Online Application Form', status: 'received', receivedAt: new Date() },
                    { name: 'Application Fee Payment', status: 'received', receivedAt: new Date() },
                    { name: 'High School Transcripts', status: 'pending' },
                    { name: 'Letter of Recommendation — 1', status: 'pending' },
                    { name: 'Letter of Recommendation — 2', status: 'pending' },
                    { name: 'Personal Statement', status: 'pending' },
                ]
            });
            await user.save();
        }
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

const validateStudent = async (req, res, next) => {
    try {
        const { externalId } = req.params;
        const normalizedId = externalId.trim().toUpperCase();
        const user = await User.findOne({ externalId: normalizedId });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Student ID not found.' });
        }

        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

const verifyAdmissionDocument = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, error: 'Document content is missing' });
        }

        // Simple regex to extract Student ID from text: Student ID: (STUxxxxxx)
        const match = content.match(/Student ID:\s*(STU\d+)/i);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Could not find a valid Student ID in the document' });
        }

        const externalId = match[1];
        const user = await User.findOne({ externalId });

        if (!user) {
            return res.status(404).json({ success: false, error: `No student found with ID ${externalId}` });
        }

        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, validateStudent, verifyAdmissionDocument };
