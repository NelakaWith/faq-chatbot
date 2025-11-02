import { ref, reactive } from "vue";
import axios from "axios";

/**
 * Composable for managing LLM (OpenRouter) chat functionality
 * Provides methods to send messages to various AI models through our backend proxy
 */
export function useChatLLM() {
  // Reactive state
  const isLoading = ref(false);
  const error = ref(null);
  const lastResponse = ref(null);

  // Chat configuration
  const config = reactive({
    model: "google/gemma-3-27b-it:free",
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
  });

  // Available models (currently using only free Gemma model)
  const availableModels = [
    {
      id: "google/gemma-3-27b-it:free",
      name: "Gemma 3 27B Instruct (Free)",
      provider: "Google",
    },
  ];

  /**
   * Get the API base URL
   */
  const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || "/api";
  };

  /**
   * Send a message to the LLM through our backend proxy
   * @param {string|Array} messages - Either a string message or array of OpenAI-format messages
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<Object>} Response from the LLM
   */
  const sendMessage = async (messages, options = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Convert string message to OpenAI format
      const formattedMessages =
        typeof messages === "string"
          ? [{ role: "user", content: messages }]
          : messages;

      // Prepare request payload
      const payload = {
        model: options.model || config.model,
        messages: formattedMessages,
        temperature: options.temperature ?? config.temperature,
        max_tokens: options.maxTokens ?? config.maxTokens,
        top_p: options.topP ?? config.topP,
        presence_penalty: options.presencePenalty ?? config.presencePenalty,
        frequency_penalty: options.frequencyPenalty ?? config.frequencyPenalty,
        stream: false, // For now, we'll handle non-streaming responses
      };

      // Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.post(`${apiBaseUrl}/chat/llm`, payload);

      lastResponse.value = response.data;
      return response.data;
    } catch (err) {
      console.error("LLM chat request error:", err);

      let errorMessage =
        "Sorry, there was an error connecting to the AI service.";

      if (err.response) {
        // Server responded with error
        const errorData = err.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;

        if (err.response.status === 401) {
          errorMessage =
            "API authentication failed. Please check your API key configuration.";
        } else if (err.response.status === 429) {
          errorMessage = "Rate limit exceeded. Please try again in a moment.";
        } else if (err.response.status === 500) {
          errorMessage = "Internal server error. Please try again later.";
        }
      } else if (err.request) {
        // Network error
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
      }

      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Send a simple text message and get the response content
   * @param {string} message - The message to send
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<string>} The response content
   */
  const sendTextMessage = async (message, options = {}) => {
    const response = await sendMessage(message, options);
    return response.choices?.[0]?.message?.content || "No response received";
  };

  /**
   * Continue a conversation with message history
   * @param {Array} messageHistory - Array of previous messages in OpenAI format
   * @param {string} newMessage - New message to add to the conversation
   * @param {Object} options - Optional configuration overrides
   * @returns {Promise<Object>} Response from the LLM
   */
  const continueConversation = async (
    messageHistory,
    newMessage,
    options = {}
  ) => {
    const updatedMessages = [
      ...messageHistory,
      { role: "user", content: newMessage },
    ];
    return await sendMessage(updatedMessages, options);
  };

  /**
   * Update model configuration
   * @param {Object} newConfig - New configuration values
   */
  const updateConfig = (newConfig) => {
    Object.assign(config, newConfig);
  };

  /**
   * Reset configuration to defaults
   */
  const resetConfig = () => {
    config.model = "google/gemma-3-27b-it:free";
    config.temperature = 0.7;
    config.maxTokens = 1000;
    config.topP = 1;
    config.presencePenalty = 0;
    config.frequencyPenalty = 0;
  };

  /**
   * Get usage information from the last response
   * @returns {Object|null} Usage information if available
   */
  const getUsage = () => {
    return lastResponse.value?.usage || null;
  };

  /**
   * Format a conversation for display
   * @param {Array} messages - Array of messages
   * @returns {Array} Formatted messages for UI display
   */
  const formatConversation = (messages) => {
    return messages.map((msg, index) => ({
      id: index,
      sender: msg.role === "user" ? "user" : "bot",
      text: msg.content,
      timestamp: new Date().toISOString(),
    }));
  };

  return {
    // State
    isLoading,
    error,
    lastResponse,
    config,
    availableModels,

    // Methods
    sendMessage,
    sendTextMessage,
    continueConversation,
    updateConfig,
    resetConfig,
    getUsage,
    formatConversation,
    getApiBaseUrl,
  };
}
