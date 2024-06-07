require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');
const adminRoutes = require('./routes/admin');
const Faq = require('./models/Faq');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());  // Enable CORS
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

let chatbotTone = "Keep your responses as short and concise as possible, while maintaining a friendly tone."; // Default tone

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

const translateText = async (text, targetLanguage) => {
    console.log(`Translate the following text to ${targetLanguage}: ${text}`);
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: `Translate the following text to ${targetLanguage}: ${text}` }],
        model: "gpt-3.5-turbo",
        max_tokens: 1000,
        temperature: 0.1,
    });
    return completion.choices[0].message.content.trim();
};

app.post('/message', async (req, res) => {
    const { message, chatHistory, language } = req.body;
    console.log('Received message:', message);
    console.log('Received language:', language);

    try {
        // Translate user message to English if necessary
        // const messageInEnglish = language !== 'English' ? await translateText(message, 'English') : message;
        // console.log('Translated message:', messageInEnglish);

        // Generate embedding for the user query
        const queryEmbeddingResponse = await openai.embeddings.create({
            input: [message],
            model: 'text-embedding-3-small',
            encoding_format: 'float',
            //dimensions: 1024,
        });

        const queryVector = queryEmbeddingResponse.data[0].embedding;
        //console.log('Query Embedding:', queryVector);

        // Perform vector search on the FAQ collection
        const faqResults = await Faq.aggregate([
            {
                '$vectorSearch': {
                    'index': 'vector_index',
                    'path': 'embedding',
                    'queryVector': queryVector,
                    'numCandidates': 5,
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

        console.log('Chat History Results:', chatHistory);

        // Construct the context for the chatbot
        const context = faqResults.map(faq => `${faq.question} ${faq.answer}`).join('\n');
        const systemPrompt = `
        Instructions:
        - You are a helpful assistant. Your job is to answer the user's question based on the relevant context fetched from FAQs and other sources.
        - Do not begin your answers with phrases like "Based on the context I have..."
        - If asked how you are doing just say respond normally, and ask how you can help them.
        - Follow the below instruction for tone of your responses:
        ${chatbotTone}
        - Do not entertain questions that are unsafe. Respond with "I can't answer that."
        - If you cannot answer a question, express uncertainty and suggest contacting customer support as a last resort.
        - Be precise and accurate with your responses to avoid misleading the user.
        - Your Chat History could be in a different language, so make sure to generate responses accurately in that language based on the context fetched for you in English.
        - You are a chatbot that is intelligent and follows the chain of thought.
        
        Chain of Thought Instructions:
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

        Chain of thought example 2:
            User query: "Where is the hotel?"
            Chatbot: "Which city is the hotel in?"
            User input: "Helsinki"
            Chatbot: "Which Helsinki hotel are you staying at? Lönnrotinkatu or Yrjönkatu?"
            User input: "Yrjönkatu"
            Chatbot: "The entrance is at Yrjönkatu 30."
        
        
        Context (Independent of Chat history):
        ${context}
        
        User query:
        ${message}
        `;

        // Format the chat history for the OpenAI API
        const messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.map(entry => ({
                role: entry.role === 'CHATBOT' ? 'assistant' : 'user',
                content: entry.message
            }))
        ];

        console.log('Formatted messages:', messages);

        // Generate a response using OpenAI
        const chatResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
        });

        const fullResponse = chatResponse.choices[0].message.content.trim();
        console.log('OpenAI response:', fullResponse);

        // Translate the response back to the selected language if necessary
        // const finalResponse = language !== 'English' ? await translateText(fullResponse, language) : fullResponse;
        // console.log('Translated response:', finalResponse);

        res.json({ response: fullResponse });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).send('Error processing message');
    }
});

// Admin routes
app.use('/admin', adminRoutes);

if (process.env.LOCAL == 'true') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
// const server = awsServerlessExpress.createServer(app);
// exports.handler = (event, context) => {
//     console.log(event);
//     console.log(context);
//     awsServerlessExpress.proxy(server, event, context);
// };
exports.handler = serverless(app);