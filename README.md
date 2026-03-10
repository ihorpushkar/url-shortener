# ⌁ URL Shortener

> A fast, minimal URL shortener built with React + Cloudflare Workers. Terminal-style UI, instant redirects, click analytics.

## ✨ Features

- **Shorten any URL** instantly with an 8-character unique code
- **Click analytics** — total clicks, unique countries, clicks today
- **Rate limiting** — max 10 requests per minute per IP
- **URL validation** — rejects invalid or malformed URLs
- **90-day expiry** — links automatically expire after 90 days
- **Responsive design** — works on mobile, tablet, and desktop
- **Terminal aesthetic** — hacker-style UI with animations
- **Client-side routing** — shareable analytics URLs (`/stats/:code`)

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Cloudflare Workers |
| Storage | Cloudflare KV (URL mapping) |
| Database | Cloudflare D1 / SQLite (click analytics) |
| Routing | React Router v6 |
| Deploy | Cloudflare Pages + Workers |

## 🚀 Live Demo

**[url-shortener-app-1qy.pages.dev](https://url-shortener-app-1qy.pages.dev)**

## 📦 Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/ihorpushkar/url-shortener.git
cd url-shortener

# 2. Install dependencies
npm install

# 3. Copy env file
cp env.example .env

# 4. Start frontend
npm run dev

# 5. Start worker locally (separate terminal)
npx wrangler dev worker/index.js
```

## 🔧 Environment Variables

Create a `.env` file in the project root:

```
VITE_WORKER_URL=https://url-shortener.YOUR_SUBDOMAIN.workers.dev
```

## ☁️ Cloudflare Setup

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv namespace create URL_STORE

# Create D1 database
wrangler d1 create url_shortener_db

# Create clicks table in production
wrangler d1 execute url_shortener_db --remote --command \
  "CREATE TABLE IF NOT EXISTS clicks (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, timestamp TEXT NOT NULL, country TEXT);"

# Deploy Worker
npx wrangler deploy

# Deploy Frontend
npx wrangler pages deploy dist --project-name url-shortener-app
```

## 📁 Project Structure

```
url-shortener/
├── src/
│   ├── components/
│   │   ├── ShortenForm.jsx   # Main URL input + result UI
│   │   └── StatsPanel.jsx    # Analytics dashboard
│   ├── App.jsx               # React Router + layout
│   └── main.jsx
├── worker/
│   └── index.js              # Cloudflare Worker (full API)
├── public/
│   └── _redirects            # Cloudflare Pages SPA routing
├── wrangler.toml             # Cloudflare configuration
├── .env.example
└── package.json
```

## 📊 How It Works

```
User enters long URL
        ↓
Worker generates 8-char code → saves to KV
        ↓
Returns short URL: url-shortener.urlcut01.workers.dev/abc12345
        ↓
Someone visits url-shortener.urlcut01.workers.dev/abc12345
        ↓
Worker reads KV → 301 redirect to original URL
        ↓
Click logged to D1: { code, timestamp, country }
        ↓
Analytics available at /stats/:code
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Create short URL |
| `GET` | `/:code` | Redirect to original URL |
| `GET` | `/api/stats/:code` | Get click analytics |

### POST /api/shorten

```json
// Request
{ "url": "https://example.com/very/long/path" }

// Response
{ "shortCode": "abc12345", "shortUrl": "https://url-shortener.urlcut01.workers.dev/abc12345" }
```

### GET /api/stats/:code

```json
{
  "code": "abc12345",
  "originalUrl": "https://example.com",
  "totalClicks": 42,
  "clicksToday": 5,
  "uniqueCountries": 3,
  "recentClicks": [
    { "country": "UA", "timestamp": "2026-03-09 12:00:00" }
  ]
}
```

## 🛡 Security

- CORS restricted to allowed origins only
- Rate limiting: 10 requests/minute per IP (stored in KV)
- URL validation on both frontend and backend
- No sensitive data in public repository

## 📄 License

MIT
