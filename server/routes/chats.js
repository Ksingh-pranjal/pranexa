const express = require('express');
const Chat = require('../models/Chat');

const router = express.Router();

// GET all chats (sidebar list)
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 }); // newest first
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load chats' });
  }
});

// POST create a new empty chat
router.post('/', async (req, res) => {
  try {
    const newChat = await Chat.create({ title: 'New chat', messages: [] });
    res.json(newChat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// POST add a message to a specific chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { role, text, image } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, user: req.userId });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    chat.messages.push({ role, text, image: image || null });

    if (chat.messages.length === 1 && role === 'user') {
      chat.title = text ? text.slice(0, 40) : 'Image chat';
    }

    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

//DELETE a chat
router.delete('/:id', async (req, res) => {
  try{
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err){
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// PATCH — rename a chat
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title: title.trim() },
      { new: true } // return the updated document, not the old one
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename chat' });
  }
});

module.exports = router;