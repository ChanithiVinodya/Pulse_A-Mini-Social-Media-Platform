<div align="center">

<br />

# ✦ PULSE

### A modern, mobile-first social media web app

*Connect. Share. Follow.*

<br />

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-Database-00E599?style=flat-square&logo=neon&logoColor=black)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<!-- ============================================================
     HERO SCREENSHOT
     Replace the placeholder below with a full-width screenshot
     of your home feed on desktop (ideally 1280×800px).
     Tip: use a screen recording tool like CleanShot X or
     Gyroflow to capture a 3-screen composite like the mockup.
     ============================================================ -->

</div>

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [✨ Features](#-features)
- [🖼️ Screenshots](#️-screenshots)
- [🏗️ Architecture](#️-architecture)
- [🗄️ Database Schema](#️-database-schema)
- [🚀 Getting Started](#-getting-started)
- [🔌 API Reference](#-api-reference)
- [📂 Project Structure](#-project-structure)
- [🛣️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## About the Project

**Pulse** is a full-stack social media web app built as part of a full-stack engineering internship program. It was designed mobile-first — meaning the UI looks and feels like a native mobile app when viewed on a phone, and adapts to a sidebar layout on desktop — while running entirely in the browser using plain HTML, CSS, and JavaScript.

The goal was to go beyond a generic CRUD demo: Pulse has a distinct dark-theme visual identity, a real relational data model, JWT auth, paginated feeds, and a 24-hour Stories feature — with a live deployed instance backed by a cloud Postgres database.

**Built with:**

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JavaScript (ES Modules) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma |
| Auth | JSON Web Tokens (JWT) + bcrypt |
| File Uploads | Multer |
| Hosting | Frontend → Netlify · Backend → Render |

---

## ✨ Features

- **🔐 Authentication** — Secure register/login with bcrypt-hashed passwords and JWT sessions
- **👤 User Profiles** — Avatar, bio, verified badge, post grid, following/followers/likes stats
- **📝 Posts** — Create text + image posts; feed shows followed users in reverse-chronological order
- **💬 Comments** — Comment on any post with live count updates
- **❤️ Likes** — One-tap like/unlike with optimistic UI (heart updates instantly)
- **➕ Follow system** — Follow/unfollow users; personalized feed built from your follows
- **📖 Stories** — Post 24-hour image stories; rail shows circles for all followed users with seen/unseen ring states
- **🔖 Bookmarks** — Save posts to a private Saved tab on your profile
- **📱 Responsive** — Mobile-first; adapts from phone → tablet → desktop with sidebar navigation
- **🌙 Dark theme** — System-level dark palette, not just a CSS invert

---

## 🖼️ Screenshots

### 🚀 Home Feed

<p align="center">
  <img src="https://github.com/user-attachments/assets/5b16cb3c-894a-4f40-a7e3-655cc10c8603" width="95%" alt="Home Feed">
</p>

<p align="center"><em>Desktop Home Feed with Stories and Sidebar Navigation</em></p>

---

### 🔐 Authentication

<p align="center">
  <img src="https://github.com/user-attachments/assets/46879389-9419-46ac-9e2e-f934170a3b51" width="48%" alt="Onboarding">
  <img src="https://github.com/user-attachments/assets/fa1016ec-adfa-404c-abfa-68b6bfce319c" width="48%" alt="Sign In">
</p>

<p align="center"><em>Onboarding • Sign In</em></p>

---

### 📝 Posts & Comments

<p align="center">
  <img src="https://github.com/user-attachments/assets/deacc8aa-f6f0-4b76-9624-b2fbe000849b" width="31%" alt="Post Detail">
  <img src="https://github.com/user-attachments/assets/f5676a00-25bd-4e0e-ac01-25ae12a8a09e" width="31%" alt="Create Post">
</p>

<p align="center"><em>Post Details • Create New Post</em></p>

---

### ❤️ Likes & Follow System

<p align="center">
  <img src="https://github.com/user-attachments/assets/838302b1-f0a8-47e5-a144-3d2051ad0abb" width="31%" alt="Likes">
  <img src="https://github.com/user-attachments/assets/b6b65bb8-f9cf-4637-aada-0d1adcc350e0" width="31%" alt="Follow System">
</p>

<p align="center"><em>Like Posts • Follow & Unfollow Users</em></p>

---

### 👤 User Profiles

<p align="center">
  <img src="https://github.com/user-attachments/assets/fe3cfd76-f612-4da3-acf3-92aed03faf4a" width="48%" alt="Own Profile">
   <img src="https://github.com/user-attachments/assets/b677f0f2-3d57-493d-9e9d-5357fbdf48fe" width="48%" alt="Other Profile">
</p>

<p align="center"><em>Your Profile • Another User's Profile</em></p>

---

### 📖 Stories

<p align="center">
  <img src="https://github.com/user-attachments/assets/a24277a4-ff1c-4770-87ac-5f017c2ddd81" width="31%" alt="Stories Rail">
  <img src="https://github.com/user-attachments/assets/96238662-dd1c-425e-83c2-6fd40d81bc01" width="31%" alt="Story Viewer">
</p>

<p align="center"><em>Stories Rail • Full-Screen Story Viewer</em></p>

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│            Browser (Client)             │
│  HTML + CSS + Vanilla JS (ES Modules)   │
│  Hosted on Netlify                      │
└──────────────┬──────────────────────────┘
               │  REST API (JSON, JWT Bearer)
               ▼
┌─────────────────────────────────────────┐
│           Express.js Server             │
│  Routes → Controllers → Prisma Client  │
│  Middleware: auth, validation, upload   │
│  Hosted on Render                       │
└──────────────┬──────────────────────────┘
               │  Prisma ORM
               ▼
┌─────────────────────────────────────────┐
│     PostgreSQL — hosted on Neon         │
│  Tables: users, posts, comments,        │
│          likes, follows, stories        │
└─────────────────────────────────────────┘
```

**Request lifecycle:** Browser `fetch()` → Express route → `authenticate` middleware verifies JWT → controller runs Prisma query → JSON response → JS updates the DOM.

---

## 🗄️ Database Schema

Five core tables plus Stories, with `@@unique` constraints at the database layer (not just app logic) to prevent double-likes and duplicate follows.

```prisma
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  email        String    @unique
  passwordHash String
  bio          String?
  avatarUrl    String?
  isVerified   Boolean   @default(false)
  createdAt    DateTime  @default(now())

  posts        Post[]
  comments     Comment[]
  likes        Like[]
  stories      Story[]
  followers    Follow[]  @relation("following")
  following    Follow[]  @relation("follower")
}

model Post {
  id        String    @id @default(uuid())
  content   String
  imageUrl  String?
  createdAt DateTime  @default(now())
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
  likes     Like[]
}

model Like {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([postId, userId])
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  follower    User     @relation("follower",  fields: [followerId],  references: [id])
  following   User     @relation("following", fields: [followingId], references: [id])
  @@unique([followerId, followingId])
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Neon](https://neon.tech) account (free) — create a project and copy the connection string

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/pulse.git
cd pulse
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Neon Postgres connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST/pulse?sslmode=require"

# JWT secret — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="your-super-secret-key-here"

# Port
PORT=3001

# Allowed origin for CORS (your frontend URL)
CLIENT_URL="http://localhost:5500"
```

### 4. Run database migrations & seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed script creates **10 demo users, 30 posts, 60 comments, and follow relationships** so the app looks alive immediately.

### 5. Start the backend server

```bash
npm run dev
# Server running at http://localhost:3001
```

### 6. Open the frontend

The frontend is static HTML/CSS/JS — open it with any local server:

```bash
cd ../frontend
npx serve .
# or use the VS Code Live Server extension
```

Then open [http://localhost:5500](http://localhost:5500) in your browser.

> **Demo credentials (after seeding):**
> - Email: `demo@pulse.app` · Password: `pulse123`

---

## 🔌 API Reference

All authenticated routes require the header:
```
Authorization: Bearer <jwt_token>
```

Error responses always follow: `{ "error": "descriptive message" }`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Register a new user |
| `POST` | `/api/auth/login` | ✗ | Login, returns JWT |
| `GET` | `/api/users/:username` | ✗ | Get a user's public profile |
| `PUT` | `/api/users/me` | ✓ | Update own profile (avatar, bio) |
| `GET` | `/api/posts` | ✓ | Paginated feed from followed users |
| `POST` | `/api/posts` | ✓ | Create a new post |
| `GET` | `/api/posts/:id` | ✗ | Get a single post |
| `DELETE` | `/api/posts/:id` | ✓ | Delete own post |
| `GET` | `/api/posts/:id/comments` | ✗ | List comments on a post |
| `POST` | `/api/posts/:id/comments` | ✓ | Add a comment |
| `POST` | `/api/posts/:id/like` | ✓ | Toggle like (like/unlike) |
| `POST` | `/api/users/:id/follow` | ✓ | Toggle follow (follow/unfollow) |
| `GET` | `/api/users/:id/followers` | ✗ | List a user's followers |
| `GET` | `/api/users/:id/following` | ✗ | List who a user follows |
| `GET` | `/api/stories` | ✓ | Stories from followed users (last 24h) |
| `POST` | `/api/stories` | ✓ | Post a new story |

---

## 📂 Project Structure

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
├── docs/
│   └── screenshots/     # README screenshots (add your images here)
└── README.md
```

---

## 🛣️ Roadmap

- [x] Auth (register, login, JWT)
- [x] User profiles with stats + post grid
- [x] Posts with image upload
- [x] Comments
- [x] Like system with optimistic UI
- [x] Follow system + personalized feed
- [x] 24-hour Stories
- [x] Bookmarks (Saved tab)
- [x] Responsive mobile/desktop layout
- [ ] Real-time notifications (WebSockets)
- [ ] Post search
- [ ] Direct messaging
- [ ] Cloudinary integration (persistent image CDN)
- [ ] Jest + Supertest test suite

---

## 🤝 Contributing

This project was built as an internship assignment, but contributions are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ☕ and late nights · Full-Stack Internship Program 2026

**[⬆ Back to top](#-pulse)**

</div>
