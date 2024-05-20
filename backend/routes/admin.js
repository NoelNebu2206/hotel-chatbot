const express = require('express');
const router = express.Router();
const Faq = require('../models/Faq');
const DynamicContent = require('../models/DynamicContent');

// CRUD operations for FAQs
router.get('/faqs', async (req, res) => {
    const faqs = await Faq.find();
    res.json(faqs);
});

router.post('/faqs', async (req, res) => {
    const faq = new Faq(req.body);
    await faq.save();
    res.status(201).json(faq);
});

router.put('/faqs/:id', async (req, res) => {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(faq);
});

router.delete('/faqs/:id', async (req, res) => {
    await Faq.findByIdAndDelete(req.params.id);
    res.status(204).send();
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
