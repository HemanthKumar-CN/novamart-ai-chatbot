# NovaMart AI Customer Support

A full-stack AI-powered customer support chat app. Users sign up, log in, and chat with an AI assistant that helps with orders, returns, shipping, warranty, and payments.

**Live demo:** https://novamart-ai-chatbot.vercel.app

## Tech stack

- Frontend: React 18 + Vite + TailwindCSS + Axios + React Router
- Backend: Node.js 20 + Express + Mongoose
- Auth: JWT (httpOnly cookie + Bearer fallback) + bcrypt
- Database: MongoDB (Atlas M0 or local Docker)
- AI: OpenRouter with automatic fallback across 8 free models
- DevOps: Docker + docker-compose, Nginx for production, free deploy on Render + Vercel

## Features

- Signup / login / logout with JWT
- Chat with an AI assistant, typing indicator, chat history per user
- Sidebar with all past conversations
- Server-side rate limiting (chat and auth)
- Helmet security headers, CORS, request validation
- Health endpoint at `/health`
- Responsive UI, works on mobile

## Run with Docker (recommended)

Requires Docker Desktop.

```bash
# 1. Clone and enter
git clone https://github.com/HemanthKumar-CN/novamart-ai-chatbot.git
cd novamart-ai-chatbot

# 2. Create your .env from the template
cp .env.example .env
# Edit .env and set at minimum:
#   JWT_SECRET          (any long random string, e.g. openssl rand -hex 32)
#   COOKIE_SECRET       (another long random string)
#   OPENROUTER_API_KEY  (free key from https://openrouter.ai/keys)
# Everything else has sensible defaults.

# 3. Start the whole stack (mongo + server + client)
docker compose up --build
```

Open http://localhost:5173 in your browser. First build takes 2-5 minutes (downloads images, installs deps); subsequent runs are ~5-10 seconds.

To stop: `docker compose down`. To reset everything including the database: `docker compose down -v`.

## Run locally without Docker

Requires Node.js 20+ and a MongoDB instance (local or Atlas).

```bash
# Backend
cd server
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY
npm install
npm run dev
# → http://localhost:5050

# Frontend (in a new terminal)
cd client
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173
```

## Environment variables

The full list is in `.env.example`. The required ones for a working app are:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — long random string for signing tokens
- `COOKIE_SECRET` — long random string for signed cookies
- `OPENROUTER_API_KEY` — your OpenRouter API key

Optional but recommended:

- `CLIENT_ORIGIN` — comma-separated list of allowed frontend URLs (for CORS)
- `OPENROUTER_MODEL` — primary model (defaults to `openai/gpt-oss-120b:free`)
- `NODE_ENV` — `development` or `production`

When `NODE_ENV` is not `production`, missing `JWT_SECRET` and `COOKIE_SECRET` are auto-generated at startup with a warning, so you can boot the app with just an OpenRouter key for quick testing.

## Project layout

```
client/   React + Vite frontend
server/   Express + Mongoose backend
docker-compose.yml
render.yaml   one-click deploy on Render
vercel.json   config for Vercel deploy
.env.example
```

## API reference

All endpoints are prefixed with `/api`.

Public:
- `POST /auth/signup` — body: `{ name, email, password }` — returns `{ token, user }`
- `POST /auth/login` — body: `{ email, password }` — returns `{ token, user }`

Authenticated (Bearer token or httpOnly cookie):
- `GET /auth/me` — returns current user
- `POST /auth/logout`
- `POST /chat/send` — body: `{ conversationId?, message }` — returns `{ conversationId, reply, model, messages }`
- `GET /chat/conversations` — list user's conversations
- `GET /chat/conversations/:id` — get one conversation
- `DELETE /chat/conversations/:id` — delete one conversation

Other:
- `GET /health` — service health (also pings MongoDB)

## Deployment

The app is deployed for free on:

- **Frontend** (Vercel): https://novamart-ai-chatbot.vercel.app
- **Backend** (Render free web service): connects to the frontend
- **Database** (MongoDB Atlas M0): free tier

See `DEPLOY.md` for the step-by-step deployment walkthrough.

## Customizing the AI

The AI's persona and knowledge come from `server/src/utils/systemPrompt.js`. Edit that file to change what the assistant knows, its tone, or its boundaries. The system prompt is sent on every message, so the persona stays consistent across the conversation.

## License

MIT
