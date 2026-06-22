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

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5500" }));
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

app.use(errorHandler);

module.exports = app;
