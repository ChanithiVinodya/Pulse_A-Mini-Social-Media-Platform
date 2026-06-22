const router = require('express').Router();
const { getStories, createStory } = require('../controllers/storyController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', authenticate, getStories);
router.post('/', authenticate, upload.single('story'), createStory);

module.exports = router;
