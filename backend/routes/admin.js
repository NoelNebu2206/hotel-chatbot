const express = require('express');
const router = express.Router();
const { CohereClient } = require('cohere-ai');
const Faq = require('../models/Faq');
const DynamicContent = require('../models/DynamicContent');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

// CRUD operations for FAQs
// Get all FAQs or search FAQs by keyword
router.get('/faqs', async (req, res) => {
    const { search } = req.query;
    try {
        let faqs;
        if (search) {
            const regex = new RegExp(search, 'i'); // 'i' flag for case-insensitive search
            faqs = await Faq.find({ $or: [{ question: regex }, { answer: regex }] });
        } else {
            faqs = await Faq.find();
        }
        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Error fetching FAQs' });
    }
});


//Add a new FAQ
router.post('/faqs', async (req, res) => {
    const { question, answer } = req.body;

    try {
        const faqText = question + ' ' + answer;
        // Generate embeddings for the concatenated question and answer
        const embedResponse = await cohere.embed({
            texts: [faqText],
            inputType: 'search_document',  // Correct input type for storing in a vector DB
            model: 'embed-english-v3.0',
        });

        const embedding = embedResponse.embeddings[0];

        // Create new FAQ document
        const newFaq = new Faq({
            question,
            answer,
            embedding,
        });

        // Save to MongoDB
        await newFaq.save();

        res.status(200).json({ message: 'FAQ added successfully' });
    } catch (error) {
        console.error('Error adding FAQ:', error);
        res.status(500).json({ message: 'Error adding FAQ' });
    }
});

//Update an existing FAQ
router.put('/faqs/:id', async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;

    try {
        const faqText = question + ' ' + answer;
        // Generate embeddings for the concatenated question and answer
        const embedResponse = await cohere.embed({
            texts: [faqText],
            inputType: 'search_document',
            model: 'embed-english-v3.0',
        });

        const embedding = embedResponse.embeddings[0];

        // Update FAQ document
        const updatedFaq = await Faq.findByIdAndUpdate(id, { question, answer, embedding }, { new: true });

        res.status(200).json(updatedFaq);
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({ message: 'Error updating FAQ' });
    }
});


// Delete an FAQ
router.delete('/faqs/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Faq.findByIdAndDelete(id);
        res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Error deleting FAQ' });
    }
});

// CRUD operations for dynamic content
router.get('/dynamic-content', async (req, res) => {
    const content = await DynamicContent.find();
    res.json(content);
});

router.post('/dynamic-content', async (req, res) => {
    const content = new DynamicContent(req.body);
    await content.save();
    res.status(201).json(content);
});

router.put('/dynamic-content/:id', async (req, res) => {
    const content = await DynamicContent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(content);
});

router.delete('/dynamic-content/:id', async (req, res) => {
    await DynamicContent.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

module.exports = router;
