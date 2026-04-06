const { searchService } = require("../services/searchService");
const axios = require("axios");
const { formatLegalTitle } = require("../config/legalNames");

/**
 * Handle chat requests
 */
/**
 * Handle chat requests with RAG (Retrieval-Augmented Generation)
 */
/**
 * Handle chat requests (Entry point for the chatbot UI)
 * This now leverages the unified RAG dispatcher in handleDefaultLlmChat
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

    console.log(`🚀 Chat entry point: "${message}"`);

    // The unified RAG logic is now inside handleDefaultLlmChat
    return handleDefaultLlmChat(req, res);
  } catch (error) {
    console.error("❌ Chat request error:", error);
    res.status(500).json({
      error: "Chat request failed",
      response:
        "I'm sorry, I encountered an error while processing your request.",
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

    // Build API URL with validation
    const baseUrl = process.env.GOOGLE_BASE_URL;
    if (!baseUrl) {
      return res.status(500).json({
        error: "Gemini API base URL not configured",
        message: "GOOGLE_BASE_URL environment variable is required",
      });
    }
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

    let {
      messages,
      model = process.env.GROQ_MODEL_NAME || "llama3-70b-8192",
      temperature = process.env.GROQ_TEMPERATURE,
      max_tokens = process.env.GROQ_MAX_TOKENS,
    } = req.body;

    // Parse and validate temperature
    if (typeof temperature === "string") temperature = parseFloat(temperature);
    if (isNaN(temperature) || temperature < 0 || temperature > 2) {
      temperature = 0.7; // fallback default
    }

    // Parse and validate max_tokens
    if (typeof max_tokens === "string") max_tokens = parseInt(max_tokens, 10);
    if (isNaN(max_tokens) || max_tokens < 1 || max_tokens > 4096) {
      max_tokens = 1024; // fallback default
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid request",
        message: "messages array is required",
      });
    }

    const baseUrl =
      process.env.GROQ_BASE_URL ||
      "https://api.groq.com/openai/v1/chat/completions";

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
      },
    );

    // Forward the response back to the client
    res.json(response.data);
  } catch (error) {
    console.error("❌ Groq request error:", error.message);

    if (error.response) {
      // Groq API error
      // Only include minimal, non-sensitive details
      let safeDetails = {};
      if (
        typeof error.response.data === "object" &&
        error.response.data !== null
      ) {
        // Only expose a sanitized error code/message if present
        if (error.response.data.error) {
          if (typeof error.response.data.error === "object") {
            safeDetails = {
              code: error.response.data.error.code,
              type: error.response.data.error.type,
            };
          } else {
            safeDetails = { error: error.response.data.error };
          }
        }
      }
      res.status(error.response.status).json({
        error: "Groq API error",
        message:
          error.response.data?.error?.message ||
          error.response.data?.error ||
          error.message,
        details: safeDetails,
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: "Network error",
        message: "Unable to connect to Groq API",
      });
    } else {
      // Other error
      res.status(500).json({
        error: "Internal error",
        message: "Failed to process Groq request",
      });
    }
  }
};

/**
 * Handle Default LLM chat (Dispatcher) with RAG support
 * Dispatches to specific handlers after augmenting with database context
 */
const handleDefaultLlmChat = async (req, res) => {
  let { provider, messages, message } = req.body;

  // 1. If we have a single 'message' but no messages array, create it
  if (!messages && message) {
    messages = [{ role: "user", content: message }];
  }

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const query = lastUserMsg ? lastUserMsg.content : "";

  // 2. Retrieve RAG Context (if not already handled or if desired for all queries)
  let contextPrompt = "";
  let sources = [];

  if (query) {
    try {
      console.log(`🔎 Dispatcher RAG search for: "${query}"`);
      const contextResults = await searchService.searchLegalDatabase(query);

      if (contextResults.length > 0) {
        console.log(`📚 Found ${contextResults.length} context snippets`);
        sources = contextResults.map((res) => ({
          title: formatLegalTitle(res.metadata.filename),
          chapter: res.metadata.chapter || "Unknown",
          part: res.metadata.part || "Unknown",
          score: res.score,
        }));

        contextPrompt =
          "\n# LEGAL CONTEXT FROM DATABASE (HIERARCHY-AWARE)\n" +
          contextResults
            .map((res, i) => {
              const title = formatLegalTitle(res.metadata.filename);
              const chapter = res.metadata.chapter || "Chapter Unknown";
              const part = res.metadata.part || "Part Unknown";
              return `[[Reference ${i + 1} from ${title} | ${part} | ${chapter}]]: ${res.content}`;
            })
            .join("\n\n") +
          "\n\n# INSTRUCTIONS FOR YOUR RESPONSE (STRICT):\n" +
          "1. **STRUCTURE**: Use a highly structured format with `###` Markdown headers, **bold text** for key legal terms, and bulleted/numbered lists for procedures.\n" +
          "2. **CITATIONS**: Use the Part/Chapter/Section information provided in the Reference tags for your citations.\n" +
          "3. **ACCURACY**: If a Chapter/Part is provided, use it. If not, cite only the Section and Title.\n" +
          "4. **FORMAT**: Citations as: (Source: [Title], Chapter [X], Section [Y]).\n" +
          "5. **TERMINOLOGY**: Use 'Section' for numbered points. Never use 'Snippet' or 'Point'.\n" +
          "6. **SUMMARY**: Add a 'Legal Basis' section at the end summarizing all citations.";

        // Inject context into the system message or as a new system message
        const systemMsgIndex = messages.findIndex((m) => m.role === "system");
        const systemBase =
          "You are an expert Legal Assistant. Your responses must be professional, highly structured, and strictly grounded in the provided legal context. " +
          "If the information is not in the context, clearly state that you are using general knowledge.";

        if (systemMsgIndex !== -1) {
          // Replace or append to system message
          messages[systemMsgIndex].content =
            systemBase + "\n\n" + contextPrompt;
        } else {
          messages.unshift({
            role: "system",
            content: systemBase + contextPrompt,
          });
        }
      }
    } catch (err) {
      console.error("⚠️ RAG Dispatcher Error:", err);
    }
  }

  // 3. Setup Response Interceptor to add metadata
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // If it's a standard LLM response format, wrap it with RAG metadata
    if (data && data.choices && data.choices[0]) {
      const responseText = data.choices[0].message.content;
      return originalJson({
        ...data, // Keep original LLM metadata (usage, model, etc.)
        response: responseText, // Add convenient top-level response
        sources: sources,
        source:
          sources.length > 0 ? `${sources[0].title}` : "General Knowledge",
        sourceType: sources.length > 0 ? "rag_persistent" : "llm_general",
      });
    }
    return originalJson(data);
  };

  // 4. Final Dispatch
  const p = provider
    ? provider.toLowerCase()
    : process.env.DEFAULT_LLM_PROVIDER || "groq";

  req.body.messages = messages; // Update the request body with augmented messages

  if (p === "groq") {
    return handleGroqChat(req, res);
  } else if (p === "gemini") {
    return handleGeminiChat(req, res);
  } else if (p === "openrouter") {
    return handleOpenRouterChat(req, res);
  } else {
    return handleGroqChat(req, res);
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
