const mongoose = require('mongoose');

const dynamicContentSchema = new mongoose.Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
});

module.exports = mongoose.model('DynamicContent', dynamicContentSchema);
