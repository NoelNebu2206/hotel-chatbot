require('dotenv').config();
const mongoose = require('mongoose');
const { CohereClient } = require('cohere-ai');
const Faq = require('./models/Faq');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

mongoose.connect(process.env.MONGO_URI);

(async () => {
  try {
    const faqs = await Faq.find().lean();
    console.log('Fetched FAQs:', faqs);

    const faqTexts = faqs.map(faq => faq.question + ' ' + faq.answer);
    console.log('FAQ Texts for Embedding:', faqTexts);

    const faqEmbeddings = await cohere.embed({
      texts: faqTexts,
      model: 'embed-english-v3.0',
      inputType: 'search_document',  // Change 'classification' to 'search_document'
    });

    console.log('Generated Embeddings:', faqEmbeddings);

    for (let i = 0; i < faqs.length; i++) {
      const updateResult = await Faq.findByIdAndUpdate(faqs[i]._id, { embedding: faqEmbeddings.embeddings[i] });
      console.log(`Updated FAQ ID ${faqs[i]._id}:`, updateResult);
    }

    console.log('Embeddings created and stored successfully');
  } catch (error) {
    console.error('Error creating embeddings:', error);
  } finally {
    mongoose.connection.close();
  }
})();
