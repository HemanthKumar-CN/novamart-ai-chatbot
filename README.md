# 🛍️ NovaMart — AI Customer Support Agent

A full-stack AI-powered customer support chat app for a fictional e-commerce store called **NovaMart**. Users sign up, log in, and chat with an AI assistant ("Nova") that helps with orders, returns, shipping, warranty, and payments.

> **Stack:** React (Vite) · Node.js · Express · MongoDB · JWT · OpenRouter (free tier) · Docker

---

## 🚀 Quick Start (for reviewers / your manager)

The fastest way to run the whole stack — **no Node.js, no MongoDB, no anything else needed** besides Docker.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed (provides `docker` + `docker compose`)

### Steps

```bash
# 1. Clone & enter the project
cd novamart/

# 2. Create your .env from the template
cp .env.example .env

# 3. Edit .env — set at minimum these 3 values:
#      JWT_SECRET          → any long random string (e.g. `openssl rand -hex 32`)
#      COOKIE_SECRET       → another long random string
#      OPENROUTER_API_KEY  → get a free one at https://openrouter.ai/keys
#    Everything else has sensible defaults.

# 4. Bring up the whole stack (mongo + server + client)
docker compose up --build
```

### What happens
1. Docker builds the **server** image (Node 20 alpine + npm ci)
2. Docker builds the **client** image (Vite build → nginx)
3. Docker pulls the official **`mongo:7`** image from Docker Hub (no install needed)
4. Containers start in dependency order: mongo → server → client
5. Open **http://localhost:5173** in your browser
6. Sign up, chat with Nova, done! 🎉

### First build takes ~2-5 min (downloads images + installs deps). Subsequent runs are ~5-10 sec.

### Want to use MongoDB Atlas instead of the local container?
Just override `MONGO_URI` in your `.env`:
```bash
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/novamart?retryWrites=true&w=majority
```
The local mongo container will still spin up but stay unused — harmless.

---

## ✨ Features

- 🔐 **Authentication** — signup / login / logout using JWT + bcrypt
- 💬 **AI Chat** — text input, AI-generated replies, typing indicator
- 🧠 **Multi-model fallback** — auto-switches between 6 free OpenRouter models on rate limit
- 📚 **Chat history** — saved in MongoDB, scoped per user, accessible from the sidebar
- 🛡️ **Rate limiting** — server-side limiter on chat & auth endpoints
- 🐳 **Dockerized** — `docker compose up` brings the whole stack online
- ⚡ **Bonus**: typing indicator, dev/prod env switching, error toasts, responsive UI

---

## 📁 Project Structure

```
ai-customer-support/
├── client/                  # Vite + React + Tailwind
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # ChatWindow, Sidebar, MessageBubble, etc.
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # AuthPage, ChatPage
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile           # Multi-stage: build + nginx
│   ├── nginx.conf
│   ├── package.json
│   └── .env.example
├── server/                  # Express + Mongoose API
│   ├── src/
│   │   ├── config/          # db, env validation
│   │   ├── controllers/     # auth, chat
│   │   ├── middleware/      # auth, errorHandler, rateLimiter
│   │   ├── models/          # User, Conversation
│   │   ├── routes/          # /auth, /chat
│   │   ├── services/        # openrouterService (with fallback chain)
│   │   ├── utils/           # systemPrompt (Nova persona)
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React 18 + TailwindCSS + React Router + Axios + react-markdown |
| Backend | Node.js 20 + Express + Mongoose |
| Auth | JWT + bcryptjs |
| Database | MongoDB Atlas (M0 free tier) |
| AI | OpenRouter free models (auto-fallback) |
| DevOps | Docker + docker-compose, nginx for prod |

---

## 🚀 Quick Start

You need **only two things** to run this:

1. **Node.js 20+** (you have it ✅)
2. A free **OpenRouter API key** from [openrouter.ai/keys](https://openrouter.ai/keys)
3. A free **MongoDB Atlas** connection string from [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### Step 1 — Get credentials (5 minutes)

**a) OpenRouter key**
- Sign in at <https://openrouter.ai/keys> (Google/GitHub login)
- Click **"Create Key"** → copy it (starts with `sk-or-v1-...`)

**b) MongoDB Atlas URI**
- Sign up at <https://www.mongodb.com/cloud/atlas> (free)
- Create a free **M0 cluster** (any region)
- **Database Access** → add a user (username + password)
- **Network Access** → add IP `0.0.0.0/0` (allow from anywhere) for dev
- **Database** → click **Connect** → **Drivers** → copy the SRV connection string
  ```
  mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/novamart?retryWrites=true&w=majority
  ```

### Step 2 — Run locally (no Docker, fastest)

```bash
# 1) Backend
cd server
cp .env.example .env
# Open server/.env and paste your MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY
npm install
npm run dev
# → http://localhost:5000  (health: /health)

# 2) Frontend (in a new terminal)
cd client
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173  (open this!)
```

That's it. Open <http://localhost:5173>, sign up, and chat with Nova! 🎉

---

## 🐳 Run with Docker (alternative)

If you have Docker installed:

```bash
# 1) Set up env
cp .env.example .env
# Edit .env and add MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY

# 2) Bring it all up
docker compose up --build
```

- Frontend → <http://localhost:5173>
- Backend API → <http://localhost:5000>
- API is reverse-proxied through nginx at `/api/*` on port 5173

To stop: `docker compose down`. To rebuild after code changes: `docker compose up --build`.

> **No Docker?** The local dev steps above work fine — Docker is only needed if you prefer the containerized workflow or for deployment.

---

## 🤖 AI Models (OpenRouter Free Tier)

The app uses an **automatic fallback chain** of free models. If one model returns `429` (rate limited) or errors, the next one is tried automatically.

| Priority | Model | Notes |
|---|---|---|
| 🥇 Primary | `meta-llama/llama-3.3-70b-instruct:free` | Best quality, default in `.env` |
| 🥇 | `google/gemini-2.0-flash-exp:free` | Fast, smart |
| 🥇 | `nvidia/llama-3.1-nemotron-70b-instruct:free` | NVIDIA-tuned |
| 🥈 | `meta-llama/llama-3.1-8b-instruct:free` | Smaller, faster |
| 🥈 | `qwen/qwen-2.5-7b-instruct:free` | Multilingual |
| 🥉 | `meta-llama/llama-3.2-3b-instruct:free` | Fastest, last resort |

You can change the primary by setting `OPENROUTER_MODEL` in `.env`. The chain is defined in `server/src/services/openrouterService.js`.

### Rate limiting strategy
- **Server-side**: 30 messages / 15 min per IP (via `express-rate-limit`)
- **OpenRouter-side**: auto-fallback to the next model on 429/5xx errors
- **Auth endpoints**: 20 requests / 15 min per IP

---

## 🌐 Free Deployment (3 services, $0)

### Recommended stack
- **MongoDB Atlas M0** — free forever
- **Render.com** — backend (free web service, sleeps after 15min idle)
- **Vercel** — frontend (free, instant, perfect Vite support)

### Step-by-step

#### 1. MongoDB Atlas
Already done in Quick Start above. Just use the same URI in your deploy env vars.

#### 2. Deploy the backend on Render
1. Push this repo to GitHub
2. Go to <https://render.com> → **New +** → **Web Service** → connect your repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Instance Type:** Free
4. Add environment variables (from `server/.env.example`):
   - `NODE_ENV=production`
   - `MONGO_URI=...`
   - `JWT_SECRET=...`
   - `CLIENT_ORIGIN=https://your-client.vercel.app`
   - `OPENROUTER_API_KEY=...`
   - `OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free`
   - `OPENROUTER_SITE_URL=https://your-client.vercel.app`
   - `OPENROUTER_APP_NAME=NovaMart-Support`
5. Click **Create Web Service** — wait for deploy
6. Copy the URL (e.g. `https://novamart-server.onrender.com`)

#### 3. Deploy the frontend on Vercel
1. Go to <https://vercel.com> → **Add New Project** → import your repo
2. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
3. Add environment variable:
   - `VITE_API_URL=https://novamart-server.onrender.com`
4. Click **Deploy**
5. Copy the URL (e.g. `https://novamart.vercel.app`)

#### 4. Update backend CORS
Go back to Render → your service → **Environment** → update `CLIENT_ORIGIN` to your Vercel URL → save (will auto-redeploy).

### Alternative: single-platform deploy (all on Render)

You can also serve the **client as a static site** on Render for free, which keeps everything on one dashboard. Use `render.yaml` (Blueprint) to deploy both at once.

---

## 🔌 API Reference

All endpoints prefixed with `/api` (Vite dev proxy / nginx prod proxy).

### Auth (public)
- `POST /auth/signup` — `{ name, email, password }` → `{ token, user }`
- `POST /auth/login` — `{ email, password }` → `{ token, user }`

### Auth (protected — needs `Authorization: Bearer <token>`)
- `GET  /auth/me` → `{ user }`
- `POST /auth/logout` → `{ message }`

### Chat (protected)
- `POST /chat/send` — `{ conversationId?, message }` → `{ conversationId, title, reply, model, messages }`
- `GET  /chat/conversations` → `{ conversations: [...] }`
- `GET  /chat/conversations/:id` → `{ conversation }`
- `DELETE /chat/conversations/:id` → `{ message }`

### Health
- `GET /health` → `{ status, service, env, time }`

---

## 🧪 Testing the API with curl

```bash
# Signup
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@novamart.com","password":"test123"}'

# Save the token from the response, then:
TOKEN="paste-token-here"

# Send a message
curl -X POST http://localhost:5000/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"What is your return policy?"}'

# List conversations
curl http://localhost:5000/chat/conversations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌍 Environment Variables

### Server (`server/.env` or root `.env`)

| Var | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` or `production` |
| `PORT` | no | `5000` | Server port |
| `MONGO_URI` | **yes** | — | MongoDB Atlas connection string |
| `JWT_SECRET` | **yes** | — | Long random string (use `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | no | `7d` | Token expiry |
| `CLIENT_ORIGIN` | no | `http://localhost:5173` | Comma-separated CORS origins |
| `OPENROUTER_API_KEY` | **yes** | — | Your OpenRouter key |
| `OPENROUTER_MODEL` | no | `meta-llama/llama-3.3-70b-instruct:free` | Primary model |
| `OPENROUTER_SITE_URL` | no | `http://localhost:5173` | Used in `HTTP-Referer` header |
| `OPENROUTER_APP_NAME` | no | `NovaMart-Support` | Used in `X-Title` header |

### Client (`client/.env`)

| Var | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | no (prod) | `http://localhost:5000` | Backend URL. Leave empty in Docker (nginx proxies). |

---

## 🧠 Customizing the AI Persona

Edit `server/src/utils/systemPrompt.js` to change Nova's behavior — what she knows, her tone, her policies, etc. The system prompt is sent on **every** message so the persona stays consistent.

The current prompt equips Nova with knowledge about:
- Orders & tracking
- Returns & refunds (30-day policy)
- Shipping (free over ₹999, 3-5 day delivery)
- Warranty (1-year standard)
- Payments & promos
- Account help

…and **explicit boundaries** so she doesn't make up order data or prices.

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `❌ Missing required environment variable: MONGO_URI` | Copy `.env.example` → `.env` and fill it in |
| `MongoServerError: bad auth` | Check Atlas DB user/password in `MONGO_URI` |
| `MongooseServerSelectionError: ... IP not whitelisted` | Atlas → Network Access → add `0.0.0.0/0` |
| `OpenRouter 401 Unauthorized` | Check `OPENROUTER_API_KEY` in `.env` |
| `OpenRouter 429` (all models busy) | Wait 1–2 min, or sign up for a small OpenRouter credit |
| CORS error in browser | Add your client URL to `CLIENT_ORIGIN` (comma-separated) |
| Docker build fails | Make sure you ran `cp .env.example .env` first |
| Render free server "sleeps" | First request after 15min idle takes 30-60s — this is normal for free tier |

---

## 📦 NPM Scripts

### Server
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — production start
- `npm run prod` — explicit production mode

### Client
- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

---

## 🎁 Bonus features included
- ✅ **Typing indicator** — animated 3-dot while Nova thinks
- ✅ **`express-rate-limit`** — 30 chat msgs / 15 min, 20 auth / 15 min
- ✅ **Dev/prod env switching** — `NODE_ENV` controls logging verbosity, CORS, error details
- ✅ **OpenRouter model fallback chain** — 6 free models, auto-switch on 429/5xx
- ✅ **Graceful error toasts** — friendly messages for all error states
- ✅ **Responsive UI** — works on mobile, sidebar collapses to drawer
- ✅ **Auto-title** — conversations auto-named from first message
- ✅ **Optimistic updates** — user message appears instantly
- ✅ **Nginx reverse proxy** — single-origin in production, no CORS issues

---

## 🛡️ Security notes
- Passwords are hashed with **bcrypt** (12 salt rounds)
- JWTs are signed with HS256 and stored in `localStorage` (consider `httpOnly` cookies for stricter setups)
- Helmet sets standard security headers
- `trust proxy` is enabled for accurate IP detection behind Render/Vercel
- Rate limiting on auth & chat to prevent abuse
- No secrets are committed (all in `.env`, which is gitignored)

---

## 📜 License
MIT — built as a learning / portfolio project.

---

## 🙌 Credits
- Built as a **Full Stack Challenge** submission
- AI powered by [OpenRouter](https://openrouter.ai)
- Database: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- UI: [TailwindCSS](https://tailwindcss.com)
- Build: [Vite](https://vitejs.dev)
