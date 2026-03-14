const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    externalId: {
        type: String, // Generic ID from frontend (e.g., student ID or username)
        unique: true,
        required: true
    },
    name: {
        type: String,
        default: 'Student'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    major: {
        type: String,
        default: 'Undeclared',
    },
    year: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 1,
    },
    preferences: {
        language: {
            type: String,
            default: 'en',
        },
        notificationsEnabled: {
            type: Boolean,
            default: true,
        }
    },
    admissionStatus: {
        type: String,
        enum: ['applied', 'under_review', 'accepted', 'rejected'],
        default: 'applied'
    },
    documents: [
        {
            name: { type: String, required: true },
            status: { type: String, enum: ['received', 'pending'], default: 'pending' },
            receivedAt: Date
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema);

/* Example Document Structure:
{
  "_id": ObjectId("..."),
  "userId": "STU1001",
  "name": "Jane Doe",
  "email": "jane.doe@college.edu",
  "major": "Computer Science",
  "year": 3,
  "preferences": {
    "language": "es", 
    "notificationsEnabled": true
  },
  "createdAt": ISODate("2024-03-15T08:00:00Z")
}
*/
