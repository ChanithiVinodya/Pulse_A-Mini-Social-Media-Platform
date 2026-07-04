const prisma = require("../prisma");

// Send a message
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({ error: "Receiver ID and content are required" });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true }
        },
        receiver: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// Get all conversations for the current user
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true }
        },
        receiver: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    // Group messages by the other user to form "conversations"
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: (!msg.isRead && msg.receiverId === userId) ? 1 : 0
        });
      } else {
        if (!msg.isRead && msg.receiverId === userId) {
          const conv = conversationsMap.get(otherUser.id);
          conv.unreadCount++;
        }
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    next(error);
  }
};

// Get messages for a specific conversation
exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true }
        }
      }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};
