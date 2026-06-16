# StudyOS — Developer Documentation

> Last updated: June 16, 2026

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Local Development](#local-development)
6. [Deployment (Vercel)](#deployment-vercel)
7. [Database Setup (Supabase)](#database-setup-supabase)
8. [Feature Guide](#feature-guide)
9. [API Routes](#api-routes)
10. [Known Issues & Fixes Log](#known-issues--fixes-log)

---

## Project Overview

**StudyOS** is a self-hosted DSA / academics study tracker built for SRM KTR students. It tracks:
- **DSA (Striver A2Z Sheet)** — 504 problems across 17 steps
- **COA Tracker**
- **Maths & OS Trackers**
- **Activity Calendar** (GitHub-style heatmap)
- **Weekly Planner** and **Revision Tracker**
- **Analytics Dashboard**
- **Cloud Sync** — save/restore progress across devices via Supabase
- **LeetCode Sync** — automatically mark problems solved based on your LeetCode submissions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS-in-JS (inline styles) |
| State persistence | `localStorage` via custom `useLocalStorage` hook |
| Backend (API) | Vercel Serverless Functions (`/api/**`) |
| Database | PostgreSQL via **Supabase** |
| Hosting | Vercel |
| Package manager | pnpm |

---

## Project Structure

```
Striver-sheet-fine-tuned/
├── api/                         # Vercel serverless API routes
│   ├── sync/
│   │   └── [code].js            # GET/POST progress data by sync code
│   └── leetcode/
│       └── [username].js        # Proxy: fetches LeetCode accepted submissions
├── server/
│   └── index.js                 # Express server (for local/self-hosted use only)
├── src/
│   ├── App.jsx                  # Entire frontend application (~3100 lines)
│   └── main.jsx                 # React entry point
├── dist/                        # Vite production build output (auto-generated)
├── vercel.json                  # Vercel routing config
├── .env                         # Local environment variables (never commit!)
├── .env.example                 # Template for required env variables
└── DOCS.md                      # This file
```

---

## Environment Variables

Create a `.env` file at the project root (copy from `.env.example`):

```env
# PostgreSQL connection string — use the TRANSACTION POOLER URL from Supabase
# Found at: Supabase Dashboard → Project → Settings → Database
#   → "Connect" button → Connection Method: Transaction pooler → Type: URI
#
# ⚠ Do NOT use the "Direct connection" URL — it is not reachable from Vercel's network
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### Setting up on Vercel
1. In Supabase Dashboard → your project → **Settings → Database → Connect → Transaction pooler → URI** — copy the connection string
2. Replace `[YOUR-PASSWORD]` with your database password
3. Go to Vercel project → **Settings → Environment Variables** → add `DATABASE_URL`
4. Redeploy (or push a commit — Vercel auto-deploys)

> **Important:** Always use the **Transaction pooler** URL (port `6543`) for Vercel. The Direct connection (`db.xxx.supabase.co:5432`) returns `ENOTFOUND` from Vercel's network.

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server (frontend only, hot-reload)
pnpm run dev

# Start Express backend (needed for cloud sync locally)
node server/index.js
```

> For local cloud sync, the Express server (`server/index.js`) reads `DATABASE_URL` from `.env` via your shell environment or a tool like `dotenv`.

---

## Deployment (Vercel)

The project is deployed at: **https://striver-sheet-fine-tuned.vercel.app**

Vercel automatically:
1. Runs `pnpm run build` → outputs to `dist/`
2. Serves `dist/` as static files
3. Deploys `api/**` as serverless functions
4. Routes all non-`/api/` paths to `index.html` (SPA routing — see `vercel.json`)

### Deploying a new version
Simply push to the `main` branch on GitHub. Vercel picks it up automatically.

```bash
git add .
git commit -m "your message"
git push
```

---

## Database Setup (Supabase)

The Cloud Sync feature uses a single PostgreSQL table.

### Create the table (run once in Supabase SQL Editor)

```sql
CREATE TABLE sync_data (
  code        TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Schema

| Column | Type | Description |
|--------|------|-------------|
| `code` | `TEXT` (PK) | Unique sync code generated per user (e.g. `de2b-e55a-0f1d`) |
| `data` | `JSONB` | Full serialized progress state |
| `updated_at` | `TIMESTAMPTZ` | Last save timestamp |

---

## Feature Guide

### Cloud Sync
- Click **Cloud Sync** in the sidebar
- Click **↑ Save to Cloud** — a unique sync code is generated and saved
- Copy your sync code and use it on any other device to **↓ Restore**
- Progress auto-saves 4 seconds after any change (if a sync code exists)

### LeetCode Sync
- In the **DSA Tracker**, enter your LeetCode username in the input field
- Click **Sync LeetCode**
- The app fetches your recent accepted submissions via a server-side proxy
- Problems matching LeetCode slugs in the Striver sheet are marked as solved
- The Activity Calendar is updated with the **real submission date** (not today's date)
- Already-solved problems will have their calendar dates corrected to match LeetCode

---

## API Routes

### `GET /api/sync/[code]`
Retrieve saved progress for a sync code.

**Response:**
```json
{ "data": { ...progress }, "updatedAt": "2026-06-16T05:41:00Z" }
```

**Errors:**
- `404` — code not found
- `503` — `DATABASE_URL` not configured
- `500` — database error (returns `{ "error": "..." }` with real message)

---

### `POST /api/sync/[code]`
Save progress for a sync code (upserts).

**Request body:**
```json
{ "data": { dsaData, coaData, revData, ... } }
```

**Config:** Vercel body size limit is set to **10MB** (default 4MB was too small for full progress payloads).

---

### `GET /api/leetcode/[username]`
Proxy to LeetCode's public GraphQL API — fetches up to 100 most recent accepted submissions.

**Response:**
```json
{
  "submissions": [
    { "id": "...", "title": "Two Sum", "titleSlug": "two-sum", "timestamp": "1718500000" }
  ]
}
```

**Why a proxy?**
- Avoids browser CORS errors when calling `leetcode.com` directly
- Avoids rate-limiting from third-party APIs (previously used `alfa-leetcode-api.onrender.com`)
- Runs server-side on Vercel — more reliable

---

## Known Issues & Fixes Log

| Date | Issue | Fix |
|------|-------|-----|
| Jun 16, 2026 | LeetCode sync used hardcoded username | Added `lcUsername` input field, persisted in localStorage |
| Jun 16, 2026 | Cloud Sync failed silently — no `DATABASE_URL` | Added friendly warning in SyncModal UI |
| Jun 16, 2026 | Cloud Sync failed with SSL error on Supabase | Added `ssl: { rejectUnauthorized: false }` to pg Pool |
| Jun 16, 2026 | LeetCode sync showed today's date instead of actual solve date | Reworked sync to use `timestamp` from API; corrects already-logged dates |
| Jun 16, 2026 | Cloud Sync `✗ Save failed` — Vercel 4MB body limit exceeded | Added `export const config = { api: { bodyParser: { sizeLimit: "10mb" } } }` to serverless function |
| Jun 16, 2026 | LeetCode sync failed with "Too many requests" from `alfa-leetcode-api.onrender.com` | Replaced with own Vercel proxy at `/api/leetcode/[username]` using LeetCode GraphQL |
| Jun 16, 2026 | Cloud Sync errors showed generic message, hard to debug | Error handler now surfaces actual server error message |
| Jun 16, 2026 | Cloud Sync 500 error — `getaddrinfo ENOTFOUND db.xxx.supabase.co` | Supabase direct connection is blocked by Vercel's network; switched `DATABASE_URL` to **Transaction Pooler** URL (`*.pooler.supabase.com:6543`) |
