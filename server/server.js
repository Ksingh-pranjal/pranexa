// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const chatRoute = require('./routes/chat');
const chatsDataRoute = require('./routes/chats');
const authRoute = require('./routes/auth');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://pranexa.vercel.app']
}));
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.json({ message: 'PraNexa backend is alive' });
});

app.use('/api/chat', chatRoute);
app.use('/api/chats', chatsDataRoute);
app.use('/api/auth', authRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});