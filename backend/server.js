const express = require('express');
const { CohereClient } = require('cohere-ai');
const app = express();
const port = process.env.PORT || 3000;

const cohere = new CohereClient({
    token: 'AtPKXCoEnTZlZdO2ntfu45juRMYkNtAvZdWssjWS',
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/message', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await cohere.chat({
            model: 'command',
            message: message,
        });
        res.json({ response: response.chat });
    } catch (error) {
        res.status(500).send('Error processing message');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
