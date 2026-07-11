# Mofa Chat — Full-Stack AI Chatbot

A full-stack AI chat application built with the MERN stack (MongoDB, Express, React, Node.js) that proxies requests to OpenRouter's API for access to multiple LLMs.

## Features

- Chat interface with streaming responses (tokens appear in real-time)
- Conversation history (sidebar grouped by date)
- Markdown rendering with syntax highlighting
- Model selection (configurable via `server/config/models.js`)
- Settings panel with API key override
- Responsive design (mobile + desktop)

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) or a remote MongoDB URI
- A Groq API key ([get one free here](https://console.groq.com/keys) — no credit card required)

## Setup

1. **Clone the repo and install dependencies**

```bash
cd claude-chat
npm run install-all
```

2. **Create a `.env` file** (copy from `.env.example`):

```bash
cp .env.example server/.env
```

3. **Edit `server/.env`** with your values:

```env
GROQ_API_KEY=gsk_your-key-here
MONGODB_URI=mongodb://localhost:27017/claude-chat
PORT=5000
CLIENT_URL=http://localhost:5173
```

4. **Run both client and server**:

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

## Adding Models

Edit `server/config/models.js` to add or remove models. All models run on Groq's free inference API.

To switch providers (e.g., to OpenRouter), edit `server/config/provider.js`.

## Project Structure

```
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── components/       # Sidebar, ChatWindow, etc.
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client helpers
│   │   └── styles/           # CSS (tokens, global, app)
│   └── package.json
├── server/                   # Express backend
│   ├── config/               # DB connection, model list
│   ├── middleware/           # Error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   └── server.js             # Entry point
├── .env.example              # Env var template
└── package.json              # Root (concurrently)
```

## API Endpoints

| Method | Endpoint                 | Description                    |
|--------|--------------------------|--------------------------------|
| POST   | `/api/chat/stream`       | Send message, stream response  |
| GET    | `/api/conversations`     | List all conversations         |
| GET    | `/api/conversations/:id` | Get one conversation + messages|
| POST   | `/api/conversations`     | Create new conversation        |
| PUT    | `/api/conversations/:id` | Rename conversation            |
| DELETE | `/api/conversations/:id` | Delete conversation            |
| GET    | `/api/models`            | List available models          |
| GET    | `/api/settings`          | Get user settings              |
| PUT    | `/api/settings`          | Update user settings           |

## Design System

This app follows the Claude design system specified in `DESIGN.md` with:
- Warm cream canvas (`#faf9f5`) — never pure white
- Coral primary (`#cc785c`) for CTAs and accents
- Serif display headlines (Cormorant Garamond substitute for Copernicus)
- Dark surfaces (`#181715`) for code blocks and contrast
