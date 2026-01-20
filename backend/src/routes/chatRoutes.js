const express = require("express");
const {
  handleChatRequest,
  getStatus,
  handleGeminiChat,
  handleOpenRouterChat,
  handleGroqChat,
  handleDefaultLlmChat,
} = require("../controllers/chatController");

const router = express.Router();

// Chat endpoint
router.post("/chat", handleChatRequest);

// Gemini chat completions endpoint (Legacy Default)
router.post("/chat/llm/gemini", handleGeminiChat);

// OpenRouter chat completions endpoint (Alternative)
router.post("/chat/llm/openrouter", handleOpenRouterChat);

// Groq chat completions endpoint
router.post("/chat/llm/groq", handleGroqChat);

// Default LLM endpoint (Dispatcher)
router.post("/chat/llm", handleDefaultLlmChat);

// Status endpoint
router.get("/status", getStatus);

module.exports = router;
