require('dotenv').config();
const express = require('express');
const { CohereClient } = require('cohere-ai');
const app = express();
const port = process.env.PORT || 3000;

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/message', async (req, res) => {
    const { message } = req.body;
    console.log('Received message:', message);
    try {
        const response = await cohere.chat({
            model: 'command-r',
            message: message,
        });
        console.log('Cohere response:', response);
        res.json({ response: response.text });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Error processing message');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
