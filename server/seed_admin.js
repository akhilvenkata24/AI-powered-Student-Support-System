const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const AdminUser = require('./src/models/AdminUser');
const { hashPassword } = require('./src/utils/adminAuth');

const SAMPLE_ADMIN = {
    username: 'admin',
    password: 'Admin@123',
    name: 'Campus Admin',
};

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const { passwordHash, passwordSalt } = hashPassword(SAMPLE_ADMIN.password);

        await AdminUser.findOneAndUpdate(
            { username: SAMPLE_ADMIN.username },
            {
                username: SAMPLE_ADMIN.username,
                name: SAMPLE_ADMIN.name,
                passwordHash,
                passwordSalt,
                role: 'admin',
            },
            { upsert: true, new: true }
        );

        console.log('Sample admin seeded successfully');
        console.log(`Username: ${SAMPLE_ADMIN.username}`);
        console.log(`Password: ${SAMPLE_ADMIN.password}`);
        process.exit(0);
    } catch (error) {
        console.error('Admin seeding error:', error);
        process.exit(1);
    }
};

seedAdmin();
