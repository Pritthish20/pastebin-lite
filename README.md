# 🗒️ Pastebin Lite

A production-ready, minimal Pastebin-like application built with **Next.js 14**, **TypeScript**, and **Redis**.

Users can create text pastes with optional expiration constraints, receive shareable links, and view pastes with automatic view tracking and TTL enforcement.

---

## ✨ Features

### Core Functionality

- **Create pastes** with arbitrary text content
- **Shareable URLs** for each paste (`/p/{id}`)
- **Optional TTL** (time-to-live) expiration
- **Optional view limits** (max views before deletion)
- **Atomic view counting** using Redis DECR
- **Input debouncing** (300ms) to reduce unnecessary re-renders
- **API throttling** to prevent abuse
- **Graceful error handling** with user-friendly messages
- **Responsive design** optimized for mobile and desktop

---

## 🛠️ Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| **Framework**  | Next.js 14 (App Router)     |
| **Language**   | TypeScript                  |
| **Styling**    | Tailwind CSS                |
| **Database**   | Redis (Vercel KV / Upstash) |
| **Deployment** | Vercel (serverless)         |

---

## 🗄️ Persistence Layer

### Why Redis?

Redis is used as the primary persistence layer because:

- ✅ **Serverless-compatible** (Vercel KV, Upstash)
- ✅ **Atomic operations** (DECR for view counting)
- ✅ **Built-in TTL support** (automatic expiration)
- ✅ **Low latency** (~1-5ms read/write)
- ✅ **Persists across deployments** (unlike in-memory stores)

### Data Model

Each paste is stored as a JSON object:

```
Key: paste:{id}
Value: {
  "content": "string",
  "max_views": number | null,
  "created_at": number (Unix timestamp ms)
}
TTL: Set via EXPIRE if ttl_seconds provided
```

---

## 🚀 Running Locally

<!-- ### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Redis** running locally or cloud instance

#### Install Redis (macOS)
```bash
brew install redis
brew services start redis
```

#### Install Redis (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
``` -->

### Setup Instructions

1. **Clone the repository**

```bash
   git clone <your-repo-url>
   cd pastebin-lite
```

2. **Install dependencies**

```bash
   npm install
```

3. **Configure environment variables**

   Create a `.env.local` file:

```env
   # Redis connection string
   REDIS_URL=redis://localhost:6379
```

4. **Start the development server**

```bash
   npm run dev
```

5. **Open in browser**

```
   http://localhost:3000
```

---

## 📡 API Reference

### Health Check

```http
GET /api/healthz
```

**Response:**

```json
{
  "ok": true
}
```

---

### Create Paste

```http
POST /api/pastes
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Hello, World!",
  "ttl_seconds": 3600, // Optional: expires in 1 hour
  "max_views": 10 // Optional: limited to 10 views
}
```

**Response (201):**

```json
{
  "id": "abc123",
  "url": "/p/abc123"
}
```

---

### Fetch Paste (API)

```http
GET /api/pastes/:id
```

**Response (200):**

```json
{
  "content": "Hello, World!",
  "remaining_views": 9
}
```

**Behavior:**

- Decrements `max_views` atomically
- Returns `404` if expired or view limit reached


---

### View Paste (HTML)

```http
GET /p/:id
```

Renders the paste content as HTML with:

- Syntax-highlighted pre-formatted text
- Share button with clipboard copy

---

<!-- ## 🔒 Security Features

### XSS Protection
- Content rendered as plain text (`<pre>` tags)
- No HTML parsing or script execution
- React's built-in escaping

### Rate Limiting
```typescript
// Implemented in middleware
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
```

### Input Validation
- Content length: 1 - 100,000 characters
- TTL range: 0 - 604,800 seconds (7 days)
- Max views: 1 - 1,000,000 -->

---

## ⚡ Performance Optimizations

### Client-Side

- **Input debouncing** (300ms) prevents excessive re-renders
- **Optimistic UI updates** for better perceived performance
<!-- - **Lazy hydration** for paste view pages -->

### Server-Side

- **Redis pipelining** for batch operations
<!-- - **Edge caching** via Vercel Edge Network -->
- **Connection pooling** for Redis (via `@vercel/kv`)

## 📂 Project Structure

pastebin-lite/
├── app/
│ ├── api/
│ │ ├── healthz/
│ │ │ └── route.ts # Health check endpoint
│ │ └── pastes/
│ │ ├── route.ts # POST /api/pastes
│ │ └── [id]/
│ │ └── route.ts # GET /api/pastes/:id
│ ├── p/
│ │ └── [id]/
│ │ └── page.tsx # Paste view page
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Home page (create paste)
│ └── globals.css # Global styles
├── lib/
│ ├── redis.ts # Redis client singleton
│ └── time.ts # Helper function
├── public/ # Static assets
├── .env.local # Environment variables (gitignored)
├── next.config.js # Next.js configuration
├── tailwind.config.ts # Tailwind CSS config
├── tsconfig.json # TypeScript config
└── package.json # Dependencies

---

## 📬 Contact

For questions or feedback:

- **GitHub**:(https://github.com/Pritthish20)
- **Email**: pritthishps20@gmail.com

---

<div align="center">

**Built with ❤️ using Next.js and Redis**

[Demo](https://pastebin-lite-seven-eosin.vercel.app/)

</div>
