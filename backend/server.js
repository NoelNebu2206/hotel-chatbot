require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { CohereClient } = require('cohere-ai');
const adminRoutes = require('./routes/admin');
const Faq = require('./models/Faq');

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
        // Generate embedding for the user query
        const queryEmbeddingResponse = await cohere.embed({
            texts: [message],
            model: 'embed-english-v3.0',
            inputType: 'search_query',
        });

        const queryVector = queryEmbeddingResponse.embeddings[0];
        console.log('Query Embedding:', queryVector);

        // Perform vector search on the FAQ collection
        const faqResults = await Faq.aggregate([
            {
                '$vectorSearch': {
                    'index': 'vector_index',
                    'path': 'embedding',
                    'queryVector': queryVector,
                    'numCandidates': 5,  // Number of nearest neighbors to retrieve
                    'limit': 5
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'question': 1,
                    'answer': 1,
                    'score': {
                        '$meta': 'vectorSearchScore'
                    }
                }
            }
        ]);

        console.log('Vector Search Results:', faqResults);

        // Construct the context for the chatbot
        const context = faqResults.map(faq => `${faq.question} ${faq.answer}`).join('\n');
        const contextMessage = `
            You are a helpful assistant. Your job is to answer the question of the user based on the relevant context that is fetched for you from FAQs and other sources.
            Don't begin your answers by saying something along the lines of "Based on the context I have ..." and so on.
            Please keep your responses, professional and clear.
            Don't entertain any questions that are not related to the hotel, and respond saying "I can't answer that".
            In case the user asks you a question that you cannot answer, you should respond saying you don't know for certain and suggest them to call customer support to clarify their question.
            But remember that calling customer support should be the last resort and shouldn't be a general solution.
            You have to be precise and accurate with your responses so as to not mislead the user with data that you have not been exposed to.
            
            Context:
            ${context}
            
            Question:
            ${message}
        `;

        const stream = await cohere.chatStream({
            model: 'command-r',
            message: contextMessage,
            chatHistory,
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
