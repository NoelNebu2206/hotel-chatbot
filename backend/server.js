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

let chatbotTone = "Be friendly, but also keep your responses clear, and encourage to ask about questions about hotels and services."; // Default tone

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/get-tone', (req, res) => {
    res.json({ tone: chatbotTone });
});

app.post('/update-tone', (req, res) => {
    const { newTone } = req.body;
    chatbotTone = newTone;
    res.status(200).json({ message: 'Tone updated successfully' });
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
        Instructions:
        You are a helpful assistant. Your job is to answer the user's question based on the relevant context fetched from FAQs and other sources.
        - Do not begin your answers with phrases like "Based on the context I have..."
        - If asked how you are doing just say respond normally, and ask how you can help them.
        - Follow the below instruction for tone of your responses:
        ${chatbotTone}
        - Do not entertain questions that are unsafe. Respond with "I can't answer that."
        - If you cannot answer a question, express uncertainty and suggest contacting customer support as a last resort.
        - Respond in the same language the question is asked.
        - Be precise and accurate with your responses to avoid misleading the user.
        - You are a chatbot that is intelligent and follows the chain of thought.
        
        Chain of Thought Intructions:
        - When a user asks a question that has multiple possible answers, ask clarifying questions to narrow down the options before providing a final answer.
        - If the user's input still has multiple possible answers, continue asking clarifying questions until you can give a definitive final answer. (See example 2 below for understanding how this works, you need to apply this logic to other user inputs as well).
        
        Chain of thought example 1:
            User query: "Where is the entrance of the hotel?"
            Chatbot: "What hotel are you staying at?"
            User input: [one of the following]
            - Helsinki, Lönnrotinkatu
            - Helsinki, Yrjönkatu
            - Jyväskylä
            - Tampere
            - Turku, Humalistonkatu
            - Turku, Kauppiaskatu
            - Pori
            - Vaasa
            Chatbot: [Based on the input]
            - "Helsinki, Lönnrotinkatu": "There are two entrances, A and B. The room number prefix indicates which entrance to use, e.g., Room A211. Both entrances are at Lönnrotinkatu 13."
            - "Helsinki, Yrjönkatu": "The entrance is at Yrjönkatu 30."
            - "Jyväskylä": "The entrance is at Vapaudenkatu 57."
            - "Tampere": "There are two entrances, Hämeenkatu 7 and Aleksanterinkatu 27 D. You can access all the rooms from any of these entrances."
            - "Turku, Humalistonkatu": "The entrance is at Humalistonkatu 7."
            - "Turku, Kauppiaskatu": "The entrance is at Kauppiaskatu 4."
            - "Pori": "The entrance is at Yrjönkatu 19."
            - "Vaasa": "The entrance is at Hovioikeudenpuistikko 16."

        Example 2:
            User query: "Where is the hotel?"
            Chatbot: "Which city is the hotel in?"
            User input: "Helsinki"
            Chatbot: "Which Helsinki hotel are you staying at? Lönnrotinkatu or Yrjönkatu?"
            User input: "Yrjönkatu"
            Chatbot: "The entrance is at Yrjönkatu 30."
        
        
        Context (Independent of Chat history):
        ${context}
        
        Question:
        ${message}
        `;

        const stream = await cohere.chatStream({
            model: 'command-r-plus',
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
