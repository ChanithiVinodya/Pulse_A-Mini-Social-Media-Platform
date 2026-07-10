const path = require("path");
const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const storyRoutes = require("./routes/storyRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CLIENT_URL === origin) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Pulse API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      posts: "/api/posts",
      comments: "/api/comments",
      stories: "/api/stories",
      health: "/api/health",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", followRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/messages", messageRoutes);

app.use(errorHandler);

module.exports = app;
