const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional, in case students want to leave anonymous feedback
        required: false, 
    },
    feature: {
        type: String,
        enum: ['chatbot', 'voice_interaction', 'faq', 'appointment_booking', 'general'],
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comments: {
        type: String,
        // Optional qualitative feedback text
    },
    queryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentQuery',
        // Useful to link feedback directly to a specific AI chat response
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

/* Example Document Structure:
{
  "_id": ObjectId("..."),
  "userId": ObjectId("user_alex_id"),
  "feature": "chatbot",
  "rating": 5,
  "comments": "The chatbot answered my FAFSA question perfectly and even gave me the link to the form. Very fast!",
  "queryId": ObjectId("query_fafsa_question_id"),
  "createdAt": ISODate("2024-03-16T11:20:00Z")
}
*/
