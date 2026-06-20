const prisma = require('../prisma/client');
const { AppError } = require('../middleware/errorHandler');

const toggleFollow = async (req, res, next) => {
  try {
    const { id: followingId } = req.params;

    if (followingId === req.userId) {
      throw new AppError('You cannot follow yourself', 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.userId,
          followingId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
    } else {
      await prisma.follow.create({
        data: { followerId: req.userId, followingId },
      });
    }

    const followersCount = await prisma.follow.count({
      where: { followingId },
    });

    res.json({ following: !existing, followersCount });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFollow };
