const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  image: { type: String, default: null }, 
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    title: { type: String, default: 'New chat' },
    messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);