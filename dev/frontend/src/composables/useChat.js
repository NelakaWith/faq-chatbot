import { ref, computed } from "vue";
import axios from "axios";
import { useChatLLM } from "./useChatLLM";

/**
 * Main chat composable that handles both FAQ search and LLM functionality
 * Provides a unified interface for different chat modes
 */
export function useChat() {
  // State
  const messages = ref([]);
  const isLoading = ref(false);
  const chatMode = ref("faq"); // 'faq' or 'llm'
  const conversationHistory = ref([]);

  // Initialize LLM composable
  const llm = useChatLLM();

  // Computed
  const hasMessages = computed(() => messages.value.length > 0);
  const lastMessage = computed(() => messages.value[messages.value.length - 1]);

  /**
   * Get the API base URL
   */
  const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || "/api";
  };

  /**
   * Add a message to the chat
   * @param {Object} message - Message object
   */
  const addMessage = (message) => {
    const messageWithId = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...message,
    };
    messages.value.push(messageWithId);
    return messageWithId;
  };

  /**
   * Add a user message
   * @param {string} text - Message text
   */
  const addUserMessage = (text) => {
    const message = addMessage({
      sender: "user",
      text: text.trim(),
      mode: chatMode.value,
    });

    // Add to conversation history for LLM mode
    if (chatMode.value === "llm") {
      conversationHistory.value.push({
        role: "user",
        content: text.trim(),
      });
    }

    return message;
  };

  /**
   * Add a bot message
   * @param {string} text - Message text
   * @param {Object} options - Additional options (source, suggestions, etc.)
   */
  const addBotMessage = (text, options = {}) => {
    const message = addMessage({
      sender: "bot",
      text,
      mode: chatMode.value,
      ...options,
    });

    // Add to conversation history for LLM mode
    if (chatMode.value === "llm") {
      conversationHistory.value.push({
        role: "assistant",
        content: text,
      });
    }

    return message;
  };

  /**
   * Send a message using FAQ search mode
   * @param {string} text - User message
   * @returns {Promise<Object>} Bot response
   */
  const sendFAQMessage = async (text) => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.post(`${apiBaseUrl}/chat`, {
        message: text,
      });

      const data = response.data;
      return addBotMessage(data.response, {
        source: data.source ? `📚 ${data.source}` : null,
        sourceType: data.sourceType,
        buttonSuggestions: data.buttonSuggestions || null,
        mode: "faq",
      });
    } catch (error) {
      console.error("FAQ chat request error:", error);

      let errorMessage = "Sorry, there was an error connecting to the server.";
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage =
          "Sorry, the server is not responding. Please try again later.";
      }

      return addBotMessage(errorMessage, {
        sourceType: "error",
        mode: "faq",
      });
    }
  };

  /**
   * Send a message using LLM mode
   * @param {string} text - User message
   * @param {Object} options - Optional LLM configuration
   * @returns {Promise<Object>} Bot response
   */
  const sendLLMMessage = async (text, options = {}) => {
    try {
      let response;

      if (conversationHistory.value.length > 0) {
        // Continue existing conversation
        response = await llm.continueConversation(
          conversationHistory.value,
          text,
          options
        );
      } else {
        // Start new conversation
        response = await llm.sendMessage(text, options);
      }

      const content =
        response.choices?.[0]?.message?.content || "No response received";
      const usage = response.usage;

      return addBotMessage(content, {
        sourceType: "llm",
        mode: "llm",
        model: options.model || llm.config.model,
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens,
              completionTokens: usage.completion_tokens,
              totalTokens: usage.total_tokens,
            }
          : null,
      });
    } catch (error) {
      return addBotMessage(error.message || "Failed to get LLM response", {
        sourceType: "error",
        mode: "llm",
      });
    }
  };

  /**
   * Send a message (routes to appropriate handler based on chat mode)
   * @param {string} text - User message
   * @param {Object} options - Optional configuration
   * @returns {Promise<Object>} Bot response
   */
  const sendMessage = async (text, options = {}) => {
    if (!text.trim()) return null;

    isLoading.value = true;

    try {
      // Add user message
      addUserMessage(text);

      // Route to appropriate handler
      let botMessage;
      if (chatMode.value === "llm") {
        botMessage = await sendLLMMessage(text, options);
      } else {
        botMessage = await sendFAQMessage(text);
      }

      return botMessage;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Switch chat mode
   * @param {string} mode - 'faq' or 'llm'
   */
  const switchMode = (mode) => {
    if (mode !== chatMode.value) {
      chatMode.value = mode;

      // Clear conversation history when switching to FAQ mode
      if (mode === "faq") {
        conversationHistory.value = [];
      }

      // Add system message about mode switch
      addBotMessage(
        mode === "llm"
          ? "🤖 Switched to AI Assistant mode. I can now have detailed conversations and help with various tasks."
          : "📚 Switched to FAQ mode. I'll search our knowledge base to answer your questions.",
        {
          sourceType: "system",
          mode: mode,
        }
      );
    }
  };

  /**
   * Clear all messages
   */
  const clearMessages = () => {
    messages.value = [];
    conversationHistory.value = [];
  };

  /**
   * Handle suggestion button clicks
   * @param {Object} suggestion - Suggestion object with action and value
   */
  const handleSuggestion = (suggestion) => {
    if (suggestion.action === "ask") {
      return sendMessage(suggestion.value);
    } else if (suggestion.action === "switch_mode") {
      switchMode(suggestion.value);
    }
  };

  /**
   * Get conversation summary for export
   * @returns {Object} Conversation data
   */
  const getConversationSummary = () => {
    return {
      messages: messages.value,
      mode: chatMode.value,
      timestamp: new Date().toISOString(),
      messageCount: messages.value.length,
      conversationHistory: conversationHistory.value,
    };
  };

  /**
   * Load conversation from export
   * @param {Object} conversationData - Previously exported conversation
   */
  const loadConversation = (conversationData) => {
    messages.value = conversationData.messages || [];
    chatMode.value = conversationData.mode || "faq";
    conversationHistory.value = conversationData.conversationHistory || [];
  };

  return {
    // State
    messages,
    isLoading,
    chatMode,
    conversationHistory,

    // Computed
    hasMessages,
    lastMessage,

    // LLM composable (for advanced configuration)
    llm,

    // Methods
    sendMessage,
    sendFAQMessage,
    sendLLMMessage,
    addMessage,
    addUserMessage,
    addBotMessage,
    switchMode,
    clearMessages,
    handleSuggestion,
    getConversationSummary,
    loadConversation,
    getApiBaseUrl,
  };
}
