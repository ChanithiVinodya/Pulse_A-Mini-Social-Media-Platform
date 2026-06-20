const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const generateToken = require('../utils/generateToken');
const { validateRegister, validateLogin } = require('../utils/validators');
const { serializeUser } = require('../utils/serializeUser');
const { AppError } = require('../middleware/errorHandler');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = validateRegister(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      throw new AppError(
        existing.email === email ? 'Email already registered' : 'Username already taken',
        409
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

    const token = generateToken(user.id);

    res.status(201).json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = validateLogin(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user.id);

    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
