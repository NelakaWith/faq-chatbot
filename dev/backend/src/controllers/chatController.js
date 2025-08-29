const { searchService } = require("../services/searchService");

/**
 * Handle chat requests
 */
const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Invalid message",
        response: "Please provide a valid message...",
      });
    }

    console.log(`🔍 Processing: "${message}"`);

    const result = await searchService.searchKnowledgeBase(message.trim());

    res.json(result);
  } catch (error) {
    console.error("❌ Chat request error:", error);
    res.status(500).json({
      error: "Search failed",
      response:
        "I'm sorry, I encountered an error while processing your request. Please try again.",
      source: "System",
      sourceType: "error",
    });
  }
};

/**
 * Get system status and data sources
 */
const getStatus = (req, res) => {
  try {
    const status = searchService.getStatus();
    res.json(status);
  } catch (error) {
    console.error("❌ Status request error:", error);
    res.status(500).json({
      error: "Failed to get status",
      status: "error",
    });
  }
};

module.exports = {
  handleChatRequest,
  getStatus,
};
