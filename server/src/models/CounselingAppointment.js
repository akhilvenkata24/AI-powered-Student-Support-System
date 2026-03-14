const mongoose = require('mongoose');

const counselingAppointmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    counselorName: {
        type: String,
        // Could also be a reference to a Counselor/Staff model if needed
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ['academic_advising', 'financial_aid_counseling', 'mental_health_therapy', 'career_services'],
        required: true,
    },
    mode: {
        type: String,
        enum: ['in_person', 'virtual', 'phone'],
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
        default: 'scheduled',
    },
    notes: {
        type: String,
        // Any notes the student provided when booking (or counselor notes after, if expanded)
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('CounselingAppointment', counselingAppointmentSchema);

/* Example Document Structure:
{
  "_id": ObjectId("..."),
  "studentId": ObjectId("user_john_smith_id"),
  "counselorName": "Dr. Sarah Jenkins",
  "appointmentDate": ISODate("2024-04-05T14:00:00Z"),
  "type": "mental_health_therapy",
  "mode": "virtual",
  "status": "scheduled",
  "notes": "Feeling anxious about final year project. Requested virtual session.",
  "createdAt": ISODate("2024-03-15T09:15:00Z")
}
*/
