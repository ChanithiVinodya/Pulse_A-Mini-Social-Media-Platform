const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Authentication secret is not configured", 500);
  }
  return process.env.JWT_SECRET;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.userId = decoded.userId;
    next();
  } catch (err) {
    next(err);
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.userId = decoded.userId;
  } catch {
    // Ignore invalid token for optional auth
  }

  next();
};

module.exports = { authenticate, optionalAuth };
