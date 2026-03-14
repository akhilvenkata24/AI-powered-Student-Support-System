const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    studentId: {
        type: String, // In a real app, this would be an ObjectId referencing a User model
        required: true,
        default: 'anonymous', 
    },
    question: {
        type: String,
        required: true,
    },
    aiResponse: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['general', 'admissions', 'academic', 'financial', 'mental_health', 'campus'],
        default: 'general',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Chat', chatSchema);
