const prisma = require('../prisma/client');
const { validateProfileUpdate } = require('../utils/validators');
const { serializeUser } = require('../utils/serializeUser');
const { getPublicUrl } = require('../middleware/upload');
const { AppError } = require('../middleware/errorHandler');

const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const likesReceived = await prisma.like.count({
      where: { post: { authorId: user.id } },
    });

    let isFollowing = false;
    if (req.userId && req.userId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: req.userId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    const { posts, _count, ...profile } = user;

    res.json({
      ...profile,
      followersCount: _count.followers,
      followingCount: _count.following,
      postsCount: _count.posts,
      likesReceived,
      isFollowing,
      isOwnProfile: req.userId === user.id,
      posts,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = validateProfileUpdate(req.body);

    if (req.file) {
      data.avatarUrl = getPublicUrl(req.file, 'avatar');
    }

    if (Object.keys(data).length === 0) {
      throw new AppError('No valid fields to update');
    }

    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: req.userId },
        },
      });
      if (existing) {
        throw new AppError('Username already taken', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });

    res.json(serializeUser(user));
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(serializeUser(user));
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getMe };
