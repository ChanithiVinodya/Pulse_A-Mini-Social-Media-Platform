const router = require('express').Router();
const { deleteComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

router.delete('/:id', authenticate, deleteComment);

module.exports = router;
