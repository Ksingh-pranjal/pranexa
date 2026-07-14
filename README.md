# PraNexa

PraNexa is a full-stack AI chat assistant built with the MERN stack, powered by Google's Gemini API. It supports real-time streaming responses, markdown/code rendering, image understanding, and per-user authenticated chat history.

🔗 **Live app:** https://pranexa.vercel.app

## Features
- 🔐 JWT-based authentication (signup/login)
- 💬 Real-time streaming AI responses (Server-Sent Events)
- 🖼️ Image upload with multimodal AI understanding
- 📝 Markdown rendering with syntax-highlighted code blocks
- 🗂️ Persistent, searchable chat history per user
- ✏️ Rename/delete chats, collapsible sidebar

## Tech Stack
- **Frontend:** React (Vite), react-markdown, react-syntax-highlighter
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **AI:** Google Gemini API
- **Auth:** JWT, bcrypt

## Setup

### Prerequisites
- Node.js installed
- A free MongoDB Atlas cluster
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Backend
\`\`\`bash
cd server
npm install
\`\`\`
Create a `.env` file in `server/` based on `.env.example`, and fill in your own values.
\`\`\`bash
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

Visit `http://localhost:5173`.

## Environment Variables (server/.env)
See `server/.env.example` for the required variables.