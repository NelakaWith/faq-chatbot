const express = require("express");
const {
  handleChatRequest,
  getStatus,
  handleGeminiChat,
  handleOpenRouterChat,
} = require("../controllers/chatController");

const router = express.Router();

// Chat endpoint
router.post("/chat", handleChatRequest);

// Gemini chat completions endpoint (Default LLM)
router.post("/chat/llm", handleGeminiChat);

// OpenRouter chat completions endpoint (Alternative)
router.post("/chat/llm/openrouter", handleOpenRouterChat);

// Status endpoint
router.get("/status", getStatus);

module.exports = router;
