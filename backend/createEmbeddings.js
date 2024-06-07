require('dotenv').config();
const mongoose = require('mongoose');
const OpenAI = require('openai');
const Faq = require('./models/Faq');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const faqs = await Faq.find().lean();
    console.log('Fetched FAQs:', faqs);

    const faqTexts = faqs.map(faq => faq.question + ' ' + faq.answer);
    console.log('FAQ Texts for Embedding:', faqTexts);

    const faqEmbeddings = await openai.embeddings.create({
      input: faqTexts,
      model: 'text-embedding-3-small',
      encoding_format: 'float',
      //dimensions: 1024,
    });

    console.log('Generated Embeddings:', faqEmbeddings);

    for (let i = 0; i < faqs.length; i++) {
      const updateResult = await Faq.findByIdAndUpdate(faqs[i]._id, { embedding: faqEmbeddings.data[i].embedding });
      console.log(`Updated FAQ ID ${faqs[i]._id}:`, updateResult);
    }

    console.log('Embeddings created and stored successfully');
  } catch (error) {
    console.error('Error creating embeddings:', error);
  } finally {
    mongoose.connection.close();
  }
})();
