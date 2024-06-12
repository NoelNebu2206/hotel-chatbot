const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Faq = require('../models/Faq');
const DynamicContent = require('../models/DynamicContent');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// CRUD operations for FAQs
// Get all FAQs or search FAQs by keyword
router.get('/faqs', async (req, res) => {
    const { search } = req.query;
    try {
        if (search) {
            // Generate embeddings for the search query
            const queryEmbeddingResponse = await openai.embeddings.create({
                input: [search],
                model: 'text-embedding-3-small',
                encoding_format: 'float',
            });

            const queryVector = queryEmbeddingResponse.data[0].embedding;

            // Perform vector search on the FAQ collection
            const faqResults = await Faq.aggregate([
                {
                    '$vectorSearch': {
                        'index': 'vector_index',
                        'path': 'embedding',
                        'queryVector': queryVector,
                        'numCandidates': 8,
                        'limit': 5
                    }
                },
                {
                    '$project': {
                        '_id': 1,
                        'question': 1,
                        'answer': 1,
                        'score': {
                            '$meta': 'vectorSearchScore'
                        }
                    }
                }
            ]);

            console.log('Vector Search Results:', faqResults);

            // Filter results with a score above the threshold
            const filteredResults = faqResults.filter(faq => faq.score >= 0.60);

            if (filteredResults.length > 0) {
                res.json(filteredResults);
            } else {
                res.status(200).json([]);
            }
        } else {
            const faqs = await Faq.find();
            res.json(faqs);
        }
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Error fetching FAQs' });
    }
});

// Add a new FAQ
router.post('/faqs', async (req, res) => {
    const { question, answer } = req.body;

    try {
        const faqText = question + ' ' + answer;
        // Generate embeddings for the concatenated question and answer
        const faqEmbedding = await openai.embeddings.create({
            input: [faqText],
            model: 'text-embedding-3-small',
            encoding_format: 'float',
        });

        const embedding = faqEmbedding.data[0].embedding;

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

// Update an existing FAQ
router.put('/faqs/:id', async (req, res) => {
    const { id } = req.params;
    const { question, answer } = req.body;

    try {
        const faqText = question + ' ' + answer;
        // Generate embeddings for the concatenated question and answer
        const faqEmbedding = await openai.embeddings.create({
            input: [faqText],
            model: 'text-embedding-3-small',
            encoding_format: 'float',
        });

        const embedding = faqEmbedding.data[0].embedding;

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
