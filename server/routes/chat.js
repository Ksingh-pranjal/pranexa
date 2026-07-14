const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini with your key (read once when the server starts)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let result;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        result = await model.generateContent(message);
        break; // success, exit the retry loop
      } catch (err) {
        attempts++;
        if (err.status === 503 && attempts < maxAttempts) {
          console.log(`Gemini busy, retrying (${attempts}/${maxAttempts})...`);
          await new Promise(r => setTimeout(r, 1000 * attempts)); // wait a bit longer each retry
        } else {
          throw err; // not a 503, or out of retries — give up and let the outer catch handle it
        }
      }
    }

    const reply = result.response.text();
    res.json({ reply });

  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'Something went wrong talking to Gemini' });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const { message, image, mimeType } = req.body;
    if (!message && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the "parts" array Gemini expects — text and/or image together
    const parts = [];
    if (message) parts.push({ text: message });
    if (image) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image, // base64 string, WITHOUT the "data:image/...;base64," prefix
        }
      });
    }

    const result = await model.generateContentStream(parts);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Streaming error:', err);
    res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
    res.end();
  }
});

module.exports = router;