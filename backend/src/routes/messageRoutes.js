const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.post("/", messageController.sendMessage);
router.get("/conversations", messageController.getConversations);
router.get("/:otherUserId", messageController.getMessages);

module.exports = router;
