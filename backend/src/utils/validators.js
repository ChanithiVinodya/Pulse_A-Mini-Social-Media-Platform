const { AppError } = require('../middleware/errorHandler');

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new AppError('Username, email, and password are required');
  }

  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!USERNAME_REGEX.test(trimmedUsername)) {
    throw new AppError('Username must be 3-30 characters (letters, numbers, underscore only)');
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    throw new AppError('Invalid email address');
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters');
  }

  return { username: trimmedUsername, email: trimmedEmail, password };
};

const validateLogin = ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Email and password are required');
  }

  return { email: email.trim().toLowerCase(), password };
};

const validateProfileUpdate = ({ username, bio }) => {
  const data = {};

  if (username !== undefined) {
    const trimmedUsername = username.trim();
    if (!USERNAME_REGEX.test(trimmedUsername)) {
      throw new AppError('Username must be 3-30 characters (letters, numbers, underscore only)');
    }
    data.username = trimmedUsername;
  }

  if (bio !== undefined) {
    if (bio.length > 500) {
      throw new AppError('Bio must be 500 characters or less');
    }
    data.bio = bio.trim();
  }

  return data;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
};
