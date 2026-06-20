const prisma = require('../prisma/client');
const { AppError } = require('../middleware/errorHandler');

const toggleLike = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const existing = await prisma.like.findUnique({
      where: {
        postId_userId: { postId, userId: req.userId },
      },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { postId, userId: req.userId },
      });
    }

    const count = await prisma.like.count({ where: { postId } });

    res.json({ liked: !existing, count });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleLike };
