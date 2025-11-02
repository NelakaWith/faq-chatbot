const { searchService } = require("../services/searchService");
const axios = require("axios");

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

    // Ensure UI gets button suggestions even for plain fallback responses
    if (
      result &&
      result.sourceType === "fallback" &&
      !result.buttonSuggestions
    ) {
      result.buttonSuggestions = [
        {
          text: "How do I create an account?",
          action: "ask",
          value: "How do I create an account?",
        },
        {
          text: "How do I reset my password?",
          action: "ask",
          value: "How do I reset my password?",
        },
        {
          text: "How can I contact customer support?",
          action: "ask",
          value: "How can I contact customer support?",
        },
      ];
    }

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

/**
 * Handle OpenRouter chat completions requests
 */
const handleOpenRouterChat = async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OpenRouter API key not configured",
        message: "OPENROUTER_API_KEY environment variable is required",
      });
    }

    // Forward the request to OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(process.env.OPENROUTER_REFERER || req.get("Referer")
            ? {
                "HTTP-Referer":
                  process.env.OPENROUTER_REFERER || req.get("Referer"),
              }
            : {}),
          "X-Title": process.env.OPENROUTER_TITLE || "FAQ Chatbot",
        },
      }
    );

    // Forward the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error("❌ OpenRouter request error:", error.message);

    if (error.response) {
      // OpenRouter API error
      res.status(error.response.status).json({
        error: "OpenRouter API error",
        message: error.response.data?.error?.message || error.message,
        details: error.response.data,
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: "Network error",
        message: "Unable to connect to OpenRouter API",
      });
    } else {
      // Other error
      res.status(500).json({
        error: "Internal error",
        message: "Failed to process OpenRouter request",
      });
    }
  }
};

module.exports = {
  handleChatRequest,
  getStatus,
  handleOpenRouterChat,
};
