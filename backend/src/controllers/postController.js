const prisma = require('../prisma/client');
const { getPublicUrl } = require('../middleware/upload');
const { AppError } = require('../middleware/errorHandler');

const formatPost = (post, userId) => ({
  id: post.id,
  content: post.content,
  imageUrl: post.imageUrl,
  createdAt: post.createdAt,
  author: post.author,
  likesCount: post._count.likes,
  commentsCount: post._count.comments,
  likedByMe: userId && post.likes
    ? post.likes.some((like) => like.userId === userId)
    : false,
});

const getFeed = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const follows = await prisma.follow.findMany({
      where: { followerId: req.userId },
      select: { followingId: true },
    });

    const authorIds = [...follows.map((f) => f.followingId), req.userId];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: { in: authorIds } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: req.userId }, select: { userId: true } },
        },
      }),
      prisma.post.count({ where: { authorId: { in: authorIds } } }),
    ]);

    res.json({
      posts: posts.map((post) => formatPost(post, req.userId)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const include = {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          isVerified: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    };

    if (req.userId) {
      include.likes = { where: { userId: req.userId }, select: { userId: true } };
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include,
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json(formatPost(post, req.userId));
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      throw new AppError('Post content is required');
    }

    const imageUrl = req.file ? getPublicUrl(req.file, 'image') : null;

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl,
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
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: req.userId }, select: { userId: true } },
      },
    });

    res.status(201).json(formatPost(post, req.userId));
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.authorId !== req.userId) {
      throw new AppError('You can only delete your own posts', 403);
    }

    await prisma.post.delete({ where: { id } });

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeed, getPost, createPost, deletePost };
