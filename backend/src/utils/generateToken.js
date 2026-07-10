const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error(
    "Missing JWT_SECRET environment variable. Set JWT_SECRET in backend/.env before starting the server.",
  );
}

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
