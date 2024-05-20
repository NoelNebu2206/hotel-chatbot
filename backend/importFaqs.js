require('dotenv').config();
const mongoose = require('mongoose');
const Faq = require('./models/Faq');
const fs = require('fs');

mongoose.connect(process.env.MONGO_URI);

const importFaqs = async () => {
    try {
        const faqs = JSON.parse(fs.readFileSync('./FAQ.json', 'utf-8'));
        await Faq.insertMany(faqs);
        console.log('FAQs imported successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error importing FAQs:', error);
        mongoose.connection.close();
    }
};

importFaqs();
