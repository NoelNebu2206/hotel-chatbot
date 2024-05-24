const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: String,
  answer: String,
  embedding: [Number],  // Add this line to define the embedding field
});

module.exports = mongoose.model('Faq', faqSchema);
