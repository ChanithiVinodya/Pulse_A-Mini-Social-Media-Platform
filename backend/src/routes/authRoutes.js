const { register, login, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);

module.exports = router;
