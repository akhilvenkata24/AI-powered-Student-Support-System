const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        unique: true, // Prevents duplicate FAQs
    },
    answer: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['admission', 'academic', 'financial', 'campus', 'general', 'mental_health'],
        required: true,
    },
    tags: [{
        type: String, 
        // e.g., ['deadline', 'scholarship', 'FAFSA']
    }],
    aiGenerated: {
        type: Boolean,
        default: false,
        // Set to true if this FAQ was dynamically identified and created by the AI analyzing common queries
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Update the updatedAt field on save
faqSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('FAQ', faqSchema);

/* Example Document Structure:
{
  "_id": ObjectId("..."),
  "question": "When is the deadline to apply for the Merit Scholarship?",
  "answer": "The deadline for the Merit Scholarship application is May 1st for the Fall semester.",
  "category": "financial",
  "tags": ["scholarship", "deadline", "financial_aid"],
  "aiGenerated": false,
  "createdAt": ISODate("2024-03-10T10:00:00Z"),
  "updatedAt": ISODate("2024-03-10T10:00:00Z")
}
*/
