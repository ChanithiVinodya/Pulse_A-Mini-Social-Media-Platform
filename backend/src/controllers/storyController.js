const prisma = require('../prisma/client');
const { getPublicUrl } = require('../middleware/upload');
const { AppError } = require('../middleware/errorHandler');

const STORY_DURATION_MS = 24 * 60 * 60 * 1000;

const cleanupExpiredStories = async () => {
  await prisma.story.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
};

const getStories = async (req, res, next) => {
  try {
    await cleanupExpiredStories();

    const now = new Date();

    const follows = await prisma.follow.findMany({
      where: { followerId: req.userId },
      select: { followingId: true },
    });

    const authorIds = [...follows.map((f) => f.followingId), req.userId];

    const stories = await prisma.story.findMany({
      where: {
        authorId: { in: authorIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const grouped = {};
    for (const story of stories) {
      if (!grouped[story.authorId]) {
        grouped[story.authorId] = {
          author: story.author,
          stories: [],
        };
      }
      grouped[story.authorId].stories.push({
        id: story.id,
        imageUrl: story.imageUrl,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
      });
    }

    res.json({ storyGroups: Object.values(grouped) });
  } catch (err) {
    next(err);
  }
};

const createStory = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Story image is required');
    }

    const imageUrl = getPublicUrl(req.file, 'story');
    const expiresAt = new Date(Date.now() + STORY_DURATION_MS);

    const story = await prisma.story.create({
      data: {
        imageUrl,
        authorId: req.userId,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json(story);
  } catch (err) {
    next(err);
  }
};

const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      throw new AppError('Story not found', 404);
    }

    if (story.authorId !== req.userId) {
      throw new AppError('Unauthorized to delete this story', 403);
    }

    await prisma.story.delete({
      where: { id },
    });

    res.json({ message: 'Story deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStories, createStory, deleteStory };

