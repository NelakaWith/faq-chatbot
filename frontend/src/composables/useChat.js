import { ref, computed } from "vue";
import axios from "axios";
import { useChatLLM } from "./useChatLLM";

/**
 * Main chat composable that handles both search and LLM functionality
 * Provides a unified interface for different chat modes
 */
export function useChat() {
  // State
  const messages = ref([]);
  const isLoading = ref(false);
  const chatMode = ref("llm"); // 'faq' or 'llm'
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
      id: crypto.randomUUID(),
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
   * Send a message using Knowledge Base search mode
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
      let augmentedHistory = [...conversationHistory.value];

      // If a document is uploaded, retrieve relevant context for this query
      if (currentDocument.value) {
        const documentContext = await retrieveDocumentContext(text);

        if (documentContext) {
          // Add relevant context as a temporary system message
          // This only affects the current query, not the conversation history
          augmentedHistory = [
            {
              role: "system",
              content: `Context from document "${currentDocument.value.filename}":\n\n${documentContext}\n\nUse this context to help answer the user's question. If the answer is in the context, cite it.`,
            },
            ...conversationHistory.value,
          ];
        }
      }

      // Use augmented history for this specific query
      response = await llm.sendMessage(augmentedHistory, options);

      const content =
        response.choices?.[0]?.message?.content || "No response received";
      const model = response.model;
      const usage = response.usage;

      return addBotMessage(content, {
        sourceType: "llm",
        mode: "llm",
        model: model || options.model || llm.config.model,
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
      } else if (chatMode.value === "kb") {
        // KB mode: use LLM with document context (if available)
        botMessage = await sendLLMMessage(text, options);
      } else {
        // FAQ mode: use traditional search
        botMessage = await sendFAQMessage(text);
      }

      return botMessage;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Switch chat mode
   * @param {string} mode - 'faq', 'llm', or 'kb'
   */
  const switchMode = (mode) => {
    if (mode !== chatMode.value && mode !== "faq") {
      chatMode.value = mode;

      // Clear conversation history when switching modes if needed
      // (Simplified for LLM/KB only)

      // Add system message about mode switch
      addBotMessage(
        mode === "llm"
          ? "🤖 Switched to AI Assistant mode. I can now have detailed conversations and help with various tasks."
          : "📄 Switched to Knowledge Base mode. Upload a PDF and I'll analyze it for you.",
        {
          sourceType: "system",
          mode: mode,
        },
      );
    }
  };

  /**
   * Clear all messages
   */
  const clearMessages = () => {
    messages.value = [];
    conversationHistory.value = [];
    currentDocument.value = null; // Also clear document reference
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

  const currentDocument = ref(null);

  /**
   * Retrieve relevant context from uploaded document using RAG
   * @param {string} query - User's question
   * @returns {Promise<string>} Relevant context from document
   */
  const retrieveDocumentContext = async (query) => {
    if (!currentDocument.value) return null;

    try {
      const apiBaseUrl = getApiBaseUrl();
      // Use the backend's search functionality to find relevant chunks
      const response = await axios.post(`${apiBaseUrl}/chat`, {
        message: query,
      });

      // Extract relevant PDF chunks from the response
      // The backend's searchService should prioritize PDF chunks when available
      if (
        response.data.sourceType === "pdf_chunk" ||
        response.data.source?.includes(currentDocument.value)
      ) {
        return response.data.response;
      }

      return null;
    } catch (error) {
      console.warn("Failed to retrieve document context:", error);
      return null;
    }
  };

  /**
   * Upload a PDF file
   * @param {File} file - The file to upload
   */
  const uploadFile = async (file) => {
    isLoading.value = true;
    try {
      // Check if there's already a document uploaded
      const hasExistingDocument = currentDocument.value !== null;
      const oldDocumentName = currentDocument.value?.filename;

      const formData = new FormData();
      formData.append("file", file);

      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.post(`${apiBaseUrl}/rag/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      // Clear conversation history if uploading a new document
      // This prevents context confusion and token accumulation
      if (hasExistingDocument) {
        conversationHistory.value = [];
        addBotMessage(
          `📄 Switched from "${oldDocumentName}" to "${data.filename}". Previous conversation cleared to focus on the new document.`,
          {
            sourceType: "system",
            mode: chatMode.value,
          },
        );
      }

      // Update current document reference
      currentDocument.value = {
        filename: data.filename,
        chunks: data.chunks.length,
        uploadedAt: new Date().toISOString(),
      };

      // Automatically switch to KB mode if not already in LLM or KB mode
      if (chatMode.value === "faq") {
        switchMode("kb");
      }

      // Add success message
      addBotMessage(
        `I've analyzed "${data.filename}" (${data.chunks.length} chunks). You can now ask me questions about this document.`,
        {
          sourceType: "system",
          mode: chatMode.value,
        },
      );

      return true;
    } catch (error) {
      console.error("Upload error:", error);
      addBotMessage(
        `Sorry, I failed to process the document. ${error.response?.data?.error || error.message}`,
        {
          sourceType: "error",
          mode: chatMode.value,
        },
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    messages,
    isLoading,
    chatMode,
    conversationHistory,
    currentDocument, // Export state

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
    uploadFile, // Export method
    getConversationSummary,
    loadConversation,
    getApiBaseUrl,
  };
}
