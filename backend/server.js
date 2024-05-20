require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { CohereClient } = require('cohere-ai');
const adminRoutes = require('./routes/admin');
const app = express();
const port = process.env.PORT || 3000;

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

app.use(cors());  // Enable CORS
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/message', async (req, res) => {
    const { message, chatHistory } = req.body;
    console.log('Received message:', message);
    try {
        const stream = await cohere.chatStream({
            model: 'command-r',
            message: message,
            chatHistory: chatHistory || [],
        });

        let fullResponse = '';
        for await (const chat of stream) {
            if (chat.eventType === 'text-generation') {
                fullResponse += chat.text;
            }
        }
        console.log('Cohere response:', fullResponse);
        res.json({ response: fullResponse });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Error processing message');
    }
});

// Admin routes
app.use('/admin', adminRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
