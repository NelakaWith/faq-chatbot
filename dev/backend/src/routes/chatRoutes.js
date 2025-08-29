const express = require("express");
const {
  handleChatRequest,
  getStatus,
} = require("../controllers/chatController");

const router = express.Router();

// Chat endpoint
router.post("/chat", handleChatRequest);

// Status endpoint
router.get("/status", getStatus);

module.exports = router;
