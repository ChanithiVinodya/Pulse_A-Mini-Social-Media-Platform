const serializeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

module.exports = { serializeUser };
