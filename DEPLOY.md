# 🚀 Deployment Guide (100% Free)

This guide walks you through deploying **NovaMart** to production for $0/month using:
- **GitHub** — source hosting
- **MongoDB Atlas M0** — free database (512 MB, never expires)
- **Render.com** — free Node.js web service
- **Vercel** — free static hosting for the React frontend

> ⚠️ The Render free tier **sleeps after 15 minutes of no traffic**. The first request after sleep takes ~30–60s, then it's fast. Fine for demos / portfolios.

---

## Prerequisites

- A GitHub account
- A free OpenRouter key — <https://openrouter.ai/keys>
- A free MongoDB Atlas account — <https://www.mongodb.com/cloud/atlas> (or skip if you already have one)
- A free Render account — <https://render.com>
- A free Vercel account — <https://vercel.com>

> **Sign up everywhere with GitHub** — it skips password setup and links the repos automatically.

---

## Step 1 — Push your code to GitHub

You should already have a repo. If not:

```bash
cd "/Users/hemanthkumar/Desktop/Ai chat app customer support"
git init
git branch -M main
git add .
git commit -m "feat: initial commit — NovaMart AI customer support"
git remote add origin https://github.com/HemanthKumar-CN/novamart-ai-chatbot.git
git push -u origin main
```

> ✅ The `.gitignore` already blocks all `.env` files — your OpenRouter key, Mongo URI, and JWT secrets will **NOT** be pushed.

---

## Step 2 — Set up MongoDB Atlas (if you haven't)

1. Go to <https://www.mongodb.com/cloud/atlas> → **Try Free**
2. Create an **M0 Sandbox** cluster (any region, AWS recommended)
3. **Database Access** (left sidebar) → **Add New Database User**
   - Username: `hemanth_db_user` (or whatever you used)
   - Password: (the one you set)
   - Role: **Read and write to any database**
4. **Network Access** (left sidebar) → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. **Database** (left sidebar) → click **Connect** → **Drivers** → **Node.js** → copy the connection string

Your final connection string should look like:
```
mongodb+srv://hemanth_db_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/novamart?retryWrites=true&w=majority
```

> **Replace `<password>` with your actual DB user password** and add `/novamart` before the `?` to name the database.

---

## Step 3 — Deploy the backend to Render

1. Go to <https://render.com> → **Get Started for Free** → sign in with GitHub
2. Click **New +** (top right) → **Blueprint**
3. Select your repo: `HemanthKumar-CN/novamart-ai-chatbot`
4. Render auto-detects `render.yaml` and shows:
   - Service: `novamart-server`
   - Plan: Free
   - Root Dir: `server`
5. Click **Apply**
6. Wait ~30s for it to provision. Render will show `novamart-server` with status "Infrastructure issue" — that's because some env vars are still `sync: false`. Click the service → **Environment** (left sidebar)
7. Fill in the 4 required secret values:
   - `MONGO_URI` → paste your full Atlas connection string
   - `OPENROUTER_API_KEY` → paste your `sk-or-v1-...` key
   - `CLIENT_ORIGIN` → for now put `https://placeholder.vercel.app` (we'll fix it in Step 5)
   - `OPENROUTER_SITE_URL` → same as above for now
8. Click **Save Changes** → Render auto-redeploys (~2 min)
9. Once live, copy the service URL (top of page) — looks like:
   ```
   https://novamart-server.onrender.com
   ```
10. Test it: open `https://novamart-server.onrender.com/health` in your browser. You should see:
    ```json
    {"status":"ok","service":"novamart-server","env":"production","db":"connected"}
    ```

> 🎉 **First request after deploy might take 30–60s** if the service was sleeping. Subsequent requests are fast.

---

## Step 4 — Deploy the frontend to Vercel

1. Go to <https://vercel.com> → **Add New Project**
2. **Import** your `HemanthKumar-CN/novamart-ai-chatbot` repo
3. On the configure screen:
   - **Project Name**: `novamart-ai-chatbot` (or whatever you like)
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: click **Edit** → type `client` → save
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
4. Click **Environment Variables** (expand the section):
   - **Key**: `VITE_API_URL`
   - **Value**: paste your Render backend URL (e.g. `https://novamart-server.onrender.com`)
5. Click **Deploy** → wait ~1 min
6. Once live, Vercel shows your URL:
   ```
   https://novamart-ai-chatbot.vercel.app
   ```
7. Click **Visit** → you should see the NovaMart login page

---

## Step 5 — Wire CORS between backend and frontend

1. Copy your Vercel URL: `https://novamart-ai-chatbot.vercel.app`
2. Go back to Render → your `novamart-server` service → **Environment**
3. Edit these two env vars:
   - `CLIENT_ORIGIN` → `https://novamart-ai-chatbot.vercel.app`
   - `OPENROUTER_SITE_URL` → `https://novamart-ai-chatbot.vercel.app`
4. Click **Save Changes** → Render auto-redeploys (~1 min)

---

## Step 6 — Test it!

1. Open your Vercel URL in a browser
2. Click **Sign up**, create an account
3. Try sending a chat message → Nova should respond in 2-5 seconds
4. Open DevTools → Network tab → confirm requests go to `https://novamart-server.onrender.com/api/...`

### 🎉 Done! You have a live, free, full-stack AI app.

---

## Common Issues

| Issue | Fix |
|---|---|
| Backend `/health` shows `"db":"disconnected"` | Check Atlas Network Access has `0.0.0.0/0` and `MONGO_URI` password is correct |
| Signup fails with 500 | Check Render logs — usually a typo in `MONGO_URI` or missing `OPENROUTER_API_KEY` |
| Chat returns `CORS error` in browser | You forgot Step 5 — update `CLIENT_ORIGIN` on Render |
| Chat returns 429 (all models busy) | All 8 free models are rate-limited. Wait 2-3 min, or add OpenRouter credits ($5 lasts months) |
| First request takes 60s | **Normal on free tier** — Render sleeps idle services. Subsequent requests are fast. |
| Forgot to push latest code | `git add . && git commit -m "..." && git push` — Render/Vercel auto-deploy |

---

## Local Development

```bash
# Backend
cd server
npm install
npm run dev   # → http://localhost:5050

# Frontend
cd client
npm install
npm run dev   # → http://localhost:5173

# OR both via Docker
docker compose up
```
