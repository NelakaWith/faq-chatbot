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
 * Handle Gemini chat completions requests (Default)
 * Uses direct API calls to avoid package compatibility issues
 */
const handleGeminiChat = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key not configured",
        message: "GEMINI_API_KEY environment variable is required",
      });
    }

    const {
      messages,
      model = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash",
      temperature = 0.7,
      max_tokens = 2048,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "messages array is required",
      });
    }

    // Convert OpenAI-style messages to Gemini format
    const contents = [];
    let systemInstruction = "";

    for (const msg of messages) {
      if (msg.role === "system") {
        systemInstruction = msg.content;
      } else if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      } else if (msg.role === "assistant") {
        contents.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Build API URL
    const baseUrl = process.env.GOOGLE_BASE_URL;
    const url = `${baseUrl}${model}:generateContent?key=${apiKey}`;

    // Build request payload
    const payload = {
      contents: contents,
      generationConfig: {
        temperature: temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: max_tokens,
      },
    };

    // Add system instruction if provided
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    // Retry logic for rate limiting
    const delays = [1000, 2000, 4000];
    let lastError;

    for (let i = 0; i <= delays.length; i++) {
      try {
        const response = await axios.post(url, payload, {
          headers: { "Content-Type": "application/json" },
        });

        const data = response.data;

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error("No text content in response");
        }

        // Format response in OpenAI-compatible format
        return res.json({
          id: `gemini-${Date.now()}`,
          object: "chat.completion",
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: text,
              },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        });
      } catch (error) {
        lastError = error;

        // Retry on rate limit
        if (error.response?.status === 429 && i < delays.length) {
          console.log(
            `⏳ Rate limited, retrying in ${delays[i]}ms (attempt ${i + 1}/${delays.length})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delays[i]));
          continue;
        }

        // If not a retryable error or out of retries, throw
        if (i === delays.length) {
          throw lastError;
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error("❌ Gemini request error:", error.message);

    if (error.response) {
      // Gemini API error
      res.status(error.response.status).json({
        error: "Gemini API error",
        message:
          error.response.data?.error?.message ||
          error.response.data?.error ||
          error.message,
        details: error.response.data,
      });
    } else {
      // Other error
      res.status(500).json({
        error: "Internal error",
        message: error.message || "Failed to process Gemini request",
      });
    }
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
      },
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

/**
 * Handle Groq chat completions requests
 */
const handleGroqChat = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Groq API key not configured",
        message: "GROQ_API_KEY environment variable is required",
      });
    }

    const {
      messages,
      model = process.env.GROQ_MODEL_NAME || "llama3-70b-8192",
      temperature = parseFloat(process.env.GROQ_TEMPERATURE || "0.7"),
      max_tokens = parseInt(process.env.GROQ_MAX_TOKENS || "1024"),
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "messages array is required",
      });
    }

    const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1/chat/completions";

    // Forward the request to Groq API
    const response = await axios.post(
      baseUrl,
      {
        model,
        messages,
        temperature,
        max_tokens,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Forward the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error("❌ Groq request error:", error.message);

    if (error.response) {
      // Groq API error
      res.status(error.response.status).json({
        error: "Groq API error",
        message:
          error.response.data?.error?.message ||
          error.response.data?.error ||
          error.message,
        details: error.response.data,
      });
    }
  }
};

/**
 * Handle Default LLM chat (Dispatcher)
 * Dispatches to specific handlers based on provider
 */
const handleDefaultLlmChat = async (req, res) => {
  const { provider } = req.body;
  const p = provider ? provider.toLowerCase() : (process.env.DEFAULT_LLM_PROVIDER || "openrouter");

  if (p === "groq") {
    return handleGroqChat(req, res);
  } else if (p === "gemini") {
    return handleGeminiChat(req, res);
  } else if (p === "openrouter") {
    return handleOpenRouterChat(req, res);
  } else {
    // Fallback to OpenRouter for backward compatibility if provider is unknown or not set
    return handleOpenRouterChat(req, res);
  }
};

module.exports = {
  handleChatRequest,
  getStatus,
  handleGeminiChat,
  handleOpenRouterChat,
  handleGroqChat,
  handleDefaultLlmChat,
};
