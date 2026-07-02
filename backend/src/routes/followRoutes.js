const router = require('express').Router();
const { toggleFollow, getFollowers, getFollowing } = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');

router.post('/:id/follow', authenticate, toggleFollow);
router.get('/:id/followers', authenticate, getFollowers);
router.get('/:id/following', authenticate, getFollowing);

module.exports = router;
