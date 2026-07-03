const router = require('express').Router();
const { getProfile, updateProfile, getMe, searchUsers, getSavedPosts } = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/me', authenticate, getMe);
router.get('/me/saved', authenticate, getSavedPosts);
router.get('/search', authenticate, searchUsers);
router.put('/me', authenticate, upload.single('avatar'), updateProfile);
router.get('/:username', optionalAuth, getProfile);

module.exports = router;
