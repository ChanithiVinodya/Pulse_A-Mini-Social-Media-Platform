# Pulse

A production-quality mini social media web application. Share posts, stories, likes, and comments with the people you follow.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES modules) |
| Backend | Node.js, Express.js (MVC) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | JWT + bcrypt |

## Features

- User registration and login (JWT)
- Profile management with avatar upload
- Posts with optional images
- Personalized feed (followed users + own posts)
- Like/unlike with optimistic UI
- Comments
- Follow/unfollow
- 24-hour stories
- Mobile-first responsive layout (Instagram-style dark theme)

## Project Structure

```
pulse/
├── backend/
│   ├── prisma/          # Schema and migrations
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── routes/      # Express routes
│   │   ├── middleware/  # Auth, upload, errors
│   │   └── utils/       # Token, validators
│   ├── uploads/         # Local file storage
│   └── server.js
├── frontend/
│   ├── pages/           # HTML pages
│   ├── css/             # Styles
│   ├── js/              # Modules and components
│   └── assets/
└── README.md
```

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL instance)
- A static file server for the frontend (Live Server or `npx serve`)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-random-secret-at-least-32-characters"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5500
```

Run database migrations:

```bash
npm run db:migrate
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 2. Frontend

Serve the `frontend/` directory on port **5500** (must match `CLIENT_URL` for CORS):

**Option A — VS Code Live Server**

Open `frontend/index.html` with the Live Server extension (port 5500).

**Option B — npx serve**

```bash
npx serve frontend -p 5500
```

Open `http://localhost:5500` in your browser.

## API Reference

All protected routes require:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register `{ username, email, password }` |
| POST | `/api/auth/login` | Login `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/logout` | Logout (client clears token) |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Yes | Current user |
| GET | `/api/users/:username` | Optional | User profile |
| PUT | `/api/users/me` | Yes | Update profile (multipart for avatar) |
| POST | `/api/users/:id/follow` | Yes | Toggle follow |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts?page=1&limit=10` | Yes | Personalized feed |
| POST | `/api/posts` | Yes | Create post (multipart: `content`, `image`) |
| GET | `/api/posts/:id` | Optional | Single post |
| DELETE | `/api/posts/:id` | Yes | Delete own post |
| POST | `/api/posts/:id/like` | Yes | Toggle like → `{ liked, count }` |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts/:id/comments` | No | List comments |
| POST | `/api/posts/:id/comments` | Yes | Create comment |
| DELETE | `/api/comments/:id` | Yes | Delete comment |

### Stories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stories` | Yes | Active stories (24h) |
| POST | `/api/stories` | Yes | Create story (multipart: `story`) |

### Error Responses

```json
{ "error": "Human-readable message" }
```

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate) |

## Uploads

Files are stored locally under:

```
backend/uploads/
├── avatars/
├── posts/
└── stories/
```

The upload middleware in `src/middleware/upload.js` is structured so Cloudinary can replace local storage later by changing only that module.

## Design System

| Token | Value |
|-------|-------|
| Background | `#121212` |
| Cards | `#1E1E1E` |
| Primary | `#22C55E` |
| Secondary | `#A78BFA` |
| Like | `#EF4444` |

## Responsive Breakpoints

- **Mobile** (<600px): Single column, bottom navigation
- **Tablet** (600–1024px): Centered feed, max-width 600px
- **Desktop** (>1024px): Sidebar + feed + right panel

## License

ISC
