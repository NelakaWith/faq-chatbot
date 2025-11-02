const express = require("express");
const {
  handleChatRequest,
  getStatus,
  handleOpenRouterChat,
} = require("../controllers/chatController");

const router = express.Router();

// Chat endpoint
router.post("/chat", handleChatRequest);

// OpenRouter chat completions endpoint
router.post("/chat/llm", handleOpenRouterChat);

// Status endpoint
router.get("/status", getStatus);

module.exports = router;
