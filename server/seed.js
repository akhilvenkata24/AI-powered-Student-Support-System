const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FAQ = require('./src/models/FAQ');
const fs = require('fs');
const path = require('path');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing FAQs
        await FAQ.deleteMany({});
        console.log('Cleared existing FAQs');

        // Read the JSON file
        const faqData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed_faqs.json'), 'utf-8'));
        
        // Insert into DB
        await FAQ.insertMany(faqData);
        console.log(`${faqData.length} FAQs successfully seeded to the database!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
};

seedDB();
