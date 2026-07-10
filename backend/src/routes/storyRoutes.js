const router = require('express').Router();
const { getStories, createStory, deleteStory } = require('../controllers/storyController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', authenticate, getStories);
router.post('/', authenticate, upload.single('story'), createStory);
router.delete('/:id', authenticate, deleteStory);

module.exports = router;

