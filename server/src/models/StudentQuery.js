const mongoose = require('mongoose');

const studentQuerySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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
        enum: ['admission', 'academic', 'financial', 'campus', 'mental_health', 'general'],
        required: true,
    },
    sentiment: {
        score: {
            type: Number, // e.g., -1.0 to 1.0
            default: 0,
        },
        label: {
            type: String,
            enum: ['positive', 'neutral', 'negative', 'urgent'], // 'urgent' for mental health flags
            default: 'neutral',
        }
    },
    resolved: {
        type: Boolean,
        default: true, // Assuming AI gives a satisfactory answer most of the time
    },
    escalatedToHuman: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('StudentQuery', studentQuerySchema);

/* Example Document Structure:
{
  "_id": ObjectId("..."),
  "userId": ObjectId("user_jane_doe_id"),
  "question": "I feel completely overwhelmed by my exams and don't know what to do.",
  "aiResponse": "I hear that you are feeling overwhelmed, Jane. It's completely normal to feel stressed during exams. Here are some campus counseling resources...",
  "category": "mental_health",
  "sentiment": {
    "score": -0.8,
    "label": "urgent"
  },
  "resolved": false,
  "escalatedToHuman": true,
  "createdAt": ISODate("2024-03-15T08:30:00Z")
}
*/
