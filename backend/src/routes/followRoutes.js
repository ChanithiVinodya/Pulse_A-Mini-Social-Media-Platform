const router = require('express').Router();
const { toggleFollow } = require('../controllers/followController');
const { authenticate } = require('../middleware/auth');

router.post('/:id/follow', authenticate, toggleFollow);

module.exports = router;
