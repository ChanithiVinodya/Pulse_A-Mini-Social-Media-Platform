const router = require('express').Router();
const { getProfile, updateProfile, getMe } = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, upload.single('avatar'), updateProfile);
router.get('/:username', optionalAuth, getProfile);

module.exports = router;
