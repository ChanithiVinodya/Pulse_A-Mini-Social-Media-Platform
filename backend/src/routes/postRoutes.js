const router = require('express').Router();
const { getFeed, getPost, createPost, deletePost, toggleSave } = require('../controllers/postController');
const { getComments, createComment } = require('../controllers/commentController');
const { toggleLike } = require('../controllers/likeController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', authenticate, getFeed);
router.post('/', authenticate, upload.single('image'), createPost);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/save', authenticate, toggleSave);
router.post('/:id/like', authenticate, toggleLike);
router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, createComment);

module.exports = router;
