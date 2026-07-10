<div align="center">

# 📸 Pulse

### A production-quality mini social media web application

Share posts, stories, likes, and comments with the people you follow — built with a clean MVC backend and a fast, framework-free frontend.

<!-- Optional banner — replace with a real screenshot or graphic -->
<img src="./docs/screenshots/banner.png" alt="Pulse app banner" width="100%" />

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-MVC-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-000000?logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup](#-setup)
- [API Reference](#-api-reference)
- [Uploads](#-uploads)
- [Design System](#-design-system)
- [Responsive Breakpoints](#-responsive-breakpoints)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🔐 **Authentication** — Secure registration and login with JWT + bcrypt
- 🧑‍🎨 **Profiles** — Editable profiles with avatar upload
- 📝 **Posts** — Create posts with optional images
- 🧵 **Personalized feed** — See posts from people you follow, plus your own
- ❤️ **Likes** — Like/unlike posts with optimistic UI updates
- 💬 **Comments** — Comment on posts and join the conversation
- 👥 **Follow system** — Follow/unfollow other users
- ⏳ **Stories** — Share 24-hour disappearing stories
- 📱 **Responsive design** — Mobile-first, Instagram-inspired dark theme

---

## 🖼️ Screenshots

> Replace the placeholder images below with real screenshots. Store them under `docs/screenshots/` and keep the same filenames so the links stay valid.

<div align="center">

### User Profile

<img src="./docs/screenshots/profile.png" alt="User profile screenshot" width="700" />

*Profile page showing avatar, bio, follower/following counts, and post grid.*

<br>

### Posts & Feed

<img src="./docs/screenshots/posts.png" alt="Posts feed screenshot" width="700" />

*Personalized feed with image posts and captions.*

<br>

### Comments

<img src="./docs/screenshots/comments.png" alt="Comments screenshot" width="700" />

*Comment thread on a post, showing usernames and timestamps.*

<br>

### Likes & Follow System

<img src="./docs/screenshots/likes-follow.png" alt="Likes and follow system screenshot" width="700" />

*Like button with optimistic UI, and the follow/unfollow toggle on a profile.*

</div>

---

## 🛠️ Tech Stack

| Layer    | Technology                                    |
| -------- | ---------------------------------------------- |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules)   |
| Backend  | Node.js, Express.js (MVC architecture)         |
| Database | PostgreSQL (Neon)                              |
| ORM      | Prisma                                         |
| Auth     | JWT + bcrypt                                   |

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

## ✅ Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL instance)
- A static file server for the frontend (Live Server or `npx serve`)

---

## ⚙️ Setup

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

---

## 📡 API Reference

All protected routes require:

```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint              | Description                                      |
| ------ | --------------------- | ------------------------------------------------- |
| POST   | `/api/auth/register`  | Register `{ username, email, password }`          |
| POST   | `/api/auth/login`     | Login `{ email, password }` → `{ token, user }`   |
| POST   | `/api/auth/logout`    | Logout (client clears token)                      |

### Users

| Method | Endpoint                 | Auth     | Description                            |
| ------ | ------------------------ | -------- | ---------------------------------------- |
| GET    | `/api/users/me`          | Yes      | Current user                             |
| GET    | `/api/users/:username`   | Optional | User profile                             |
| PUT    | `/api/users/me`          | Yes      | Update profile (multipart for avatar)    |
| POST   | `/api/users/:id/follow`  | Yes      | Toggle follow                            |

### Posts

| Method | Endpoint                      | Auth     | Description                                  |
| ------ | ----------------------------- | -------- | ----------------------------------------------- |
| GET    | `/api/posts?page=1&limit=10`  | Yes      | Personalized feed                               |
| POST   | `/api/posts`                  | Yes      | Create post (multipart: `content`, `image`)     |
| GET    | `/api/posts/:id`              | Optional | Single post                                     |
| DELETE | `/api/posts/:id`              | Yes      | Delete own post                                 |
| POST   | `/api/posts/:id/like`         | Yes      | Toggle like → `{ liked, count }`                |

### Comments

| Method | Endpoint                   | Auth | Description     |
| ------ | -------------------------- | ---- | ----------------- |
| GET    | `/api/posts/:id/comments`  | No   | List comments      |
| POST   | `/api/posts/:id/comments`  | Yes  | Create comment      |
| DELETE | `/api/comments/:id`        | Yes  | Delete comment      |

### Stories

| Method | Endpoint        | Auth | Description                        |
| ------ | --------------- | ---- | ------------------------------------- |
| GET    | `/api/stories`  | Yes  | Active stories (24h)                  |
| POST   | `/api/stories`  | Yes  | Create story (multipart: `story`)     |

### Error Responses

```json
{ "error": "Human-readable message" }
```

| Code | Meaning               |
| ---- | ---------------------- |
| 400  | Validation error       |
| 401  | Unauthorized           |
| 403  | Forbidden              |
| 404  | Not found              |
| 409  | Conflict (duplicate)   |

---

## 📁 Uploads

Files are stored locally under:

```
backend/uploads/
├── avatars/
├── posts/
└── stories/
```

The upload middleware in `src/middleware/upload.js` is structured so Cloudinary can replace local storage later by changing only that module.

---

## 🎨 Design System

| Token      | Value       | Preview |
| ---------- | ----------- | ------- |
| Background | `#121212`   | ![#121212](https://placehold.co/20x20/121212/121212.png) |
| Cards      | `#1E1E1E`   | ![#1E1E1E](https://placehold.co/20x20/1E1E1E/1E1E1E.png) |
| Primary    | `#22C55E`   | ![#22C55E](https://placehold.co/20x20/22C55E/22C55E.png) |
| Secondary  | `#A78BFA`   | ![#A78BFA](https://placehold.co/20x20/A78BFA/A78BFA.png) |
| Like       | `#EF4444`   | ![#EF4444](https://placehold.co/20x20/EF4444/EF4444.png) |

---

## 📐 Responsive Breakpoints

| Device  | Width        | Layout                                      |
| ------- | ------------ | -------------------------------------------- |
| Mobile  | `<600px`     | Single column, bottom navigation              |
| Tablet  | `600–1024px` | Centered feed, max-width 600px                 |
| Desktop | `>1024px`    | Sidebar + feed + right panel                   |

---

## 🗺️ Roadmap

- [ ] Direct messaging
- [ ] Push notifications
- [ ] Cloudinary integration for media storage
- [ ] Post search and hashtags
- [ ] Dark/light theme toggle

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

Licensed under the **ISC License**.

<div align="center">

Made with ❤️ using Node.js, Express, PostgreSQL, and Prisma.

</div>
