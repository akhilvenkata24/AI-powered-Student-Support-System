const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const User = require('./server/src/models/User');

const seedStudents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const students = [
            {
                externalId: 'STU882910',
                name: 'Sarah Jenkins',
                email: 'sarah.j@example.com',
                admissionStatus: 'applied',
                documents: [
                    { name: 'Online Application Form', status: 'received', receivedAt: new Date() },
                    { name: 'Application Fee Payment', status: 'received', receivedAt: new Date() },
                    { name: 'High School Transcripts', status: 'pending' },
                    { name: 'Personal Statement', status: 'received', receivedAt: new Date() },
                ]
            },
            {
                externalId: 'STU449201',
                name: 'Michael Chen',
                email: 'm.chen@example.com',
                admissionStatus: 'under_review',
                documents: [
                    { name: 'Online Application Form', status: 'received', receivedAt: new Date() },
                    { name: 'Application Fee Payment', status: 'received', receivedAt: new Date() },
                    { name: 'High School Transcripts', status: 'received', receivedAt: new Date() },
                    { name: 'Personal Statement', status: 'received', receivedAt: new Date() },
                ]
            }
        ];

        for (const s of students) {
            await User.findOneAndUpdate({ externalId: s.externalId }, s, { upsert: true, new: true });
        }

        console.log('Sample students seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedStudents();
