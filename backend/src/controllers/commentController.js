const prisma = require('../prisma/client');
const { AppError } = require('../middleware/errorHandler');

const getComments = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      throw new AppError('Comment content is required');
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: req.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const isAuthor = comment.authorId === req.userId;
    const isPostOwner = comment.post.authorId === req.userId;

    if (!isAuthor && !isPostOwner) {
      throw new AppError('You can only delete your own comments or comments on your posts', 403);
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, deleteComment };
