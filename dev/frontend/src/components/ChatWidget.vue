<template>
  <div class="chat-widget">
    <div class="chat-header">
      <div class="chat-title-section">
        <span class="chat-title">🤖 FAQ Chatbot</span>
        <div class="chat-mode-indicator">
          <span v-if="chatMode === 'faq'" class="mode-badge faq"
            >📚 FAQ Mode</span
          >
          <span v-else class="mode-badge llm">🤖 AI Assistant</span>
        </div>
      </div>
      <div class="chat-controls">
        <button
          @click="toggleChatMode"
          class="mode-toggle-btn"
          :title="
            chatMode === 'faq' ? 'Switch to AI Assistant' : 'Switch to FAQ Mode'
          "
        >
          <svg
            v-if="chatMode === 'faq'"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
            />
          </svg>
        </button>
        <button
          @click="handleClearChat"
          class="clear-btn"
          title="Clear conversation"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <transition-group name="fade" tag="div">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.sender]"
        >
          <div class="avatar">
            <span v-if="msg.sender === 'bot'">🤖</span>
            <span v-else>🧑</span>
          </div>
          <div class="message-content">
            {{ msg.text }}
            <div v-if="msg.source" class="message-source">
              {{ msg.source }}
            </div>
            <div v-if="msg.model" class="message-model">🤖 {{ msg.model }}</div>
            <div v-if="msg.usage" class="message-usage">
              📊 {{ msg.usage.totalTokens }} tokens ({{
                msg.usage.promptTokens
              }}+{{ msg.usage.completionTokens }})
            </div>
            <!-- Button suggestions for fallback scenarios -->
            <div
              v-if="msg.buttonSuggestions && msg.buttonSuggestions.length > 0"
              class="suggestion-buttons"
            >
              <button
                v-for="(suggestion, suggestionIndex) in msg.buttonSuggestions"
                :key="suggestionIndex"
                @click="handleSuggestionClick(suggestion)"
                class="suggestion-btn"
              >
                {{ suggestion.text }}
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
    <div class="chat-input">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        :placeholder="isLoading ? 'Processing...' : 'Type your message...'"
        :disabled="isLoading"
        autocomplete="off"
      />
      <button
        @click="sendMessage"
        :disabled="isLoading || !inputMessage.trim()"
      >
        <svg
          v-if="!isLoading"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 24 24"
          class="loading-spinner"
        >
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, watch } from "vue";
import { useChat } from "../composables";

export default {
  name: "ChatWidget",
  setup() {
    const inputMessage = ref("");
    const messagesContainer = ref(null);

    // Use the chat composable
    const {
      messages,
      isLoading,
      chatMode,
      sendMessage,
      handleSuggestion,
      switchMode,
      clearMessages,
      llm,
    } = useChat();

    // Auto-scroll to bottom when messages change
    watch(
      messages,
      () => {
        nextTick(() => {
          if (messagesContainer.value) {
            messagesContainer.value.scrollTop =
              messagesContainer.value.scrollHeight;
          }
        });
      },
      { deep: true }
    );

    const handleSendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return;

      const userMessage = inputMessage.value;
      inputMessage.value = "";

      await sendMessage(userMessage);
    };

    const handleSuggestionClick = async (suggestion) => {
      if (suggestion.action === "ask") {
        inputMessage.value = suggestion.value;
        await handleSendMessage();
      } else if (suggestion.action === "switch_mode") {
        switchMode(suggestion.value);
      } else {
        // Use the composable's suggestion handler
        await handleSuggestion(suggestion);
      }
    };

    const toggleChatMode = () => {
      const newMode = chatMode.value === "faq" ? "llm" : "faq";
      switchMode(newMode);
    };

    const handleClearChat = () => {
      clearMessages();
    };

    // Initialize with a welcome message
    if (messages.value.length === 0) {
      nextTick(() => {
        handleSuggestion({
          action: "ask",
          value: "Welcome! How can I help you today?",
        });
      });
    }

    return {
      messages,
      inputMessage,
      messagesContainer,
      isLoading,
      chatMode,
      llm,
      sendMessage: handleSendMessage,
      handleSuggestionClick,
      toggleChatMode,
      handleClearChat,
    };
  },
};
</script>

<style scoped>
.chat-widget {
  width: 100%;
  max-width: 720px;
  height: 680px;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.1), 0 1.5px 4px 0 rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f8fafc 0%, #e3e9f7 100%);
  border: none;
  overflow: hidden;
  font-family: "Segoe UI", "Roboto", Arial, sans-serif;
}

.chat-header {
  background: linear-gradient(90deg, #007bff 0%, #6a82fb 100%);
  color: #fff;
  padding: 16px 20px 12px 20px;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-mode-indicator {
  display: flex;
  align-items: center;
}

.mode-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  opacity: 0.9;
}

.mode-badge.faq {
  background: rgba(255, 255, 255, 0.2);
}

.mode-badge.llm {
  background: rgba(255, 255, 255, 0.2);
}

.chat-controls {
  display: flex;
  gap: 8px;
}

.mode-toggle-btn,
.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-toggle-btn:hover,
.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 12px 12px 12px;
  background: transparent;
  transition: background 0.3s;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 16px;
  gap: 8px;
}
.message.user {
  flex-direction: row-reverse;
}
.message.bot {
  flex-direction: row;
}

.avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.07);
}

.message-content {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 18px;
  max-width: 75%;
  font-size: 1rem;
  word-break: break-word;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.04);
  position: relative;
}
.message.user .message-content {
  background: linear-gradient(90deg, #007bff 0%, #6a82fb 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 18px;
}
.message.bot .message-content {
  background: #f4f7fb;
  color: #222;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 18px;
}

.message-source {
  font-size: 0.85em;
  opacity: 0.7;
  margin-top: 6px;
  font-style: italic;
  color: #6a82fb;
}

.message-model {
  font-size: 0.8em;
  opacity: 0.6;
  margin-top: 4px;
  font-weight: 500;
  color: #6a82fb;
}

.message-usage {
  font-size: 0.75em;
  opacity: 0.6;
  margin-top: 2px;
  font-family: monospace;
  color: #6a82fb;
}

.suggestion-buttons {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-btn {
  padding: 10px 14px;
  background: #ffffff;
  border: 1.5px solid #e3e9f7;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #007bff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.suggestion-btn:hover {
  background: #f8fafc;
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
  transform: translateY(-1px);
}

.suggestion-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.bot .suggestion-btn {
  background: #ffffff;
  color: #007bff;
  border-color: #e3e9f7;
}

.message.bot .suggestion-btn:hover {
  background: #f0f7ff;
  border-color: #007bff;
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 14px 12px 14px 12px;
  background: #f8fafc;
  border-top: 1px solid #e3e9f7;
  gap: 10px;
}
.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #c7d0e1;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: #fff;
  transition: border 0.2s;
}
.chat-input input:focus {
  border-color: #6a82fb;
}

.chat-input input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.chat-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.chat-input button:disabled:hover {
  background: #ccc;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.chat-input button {
  padding: 8px 16px;
  background: linear-gradient(90deg, #007bff 0%, #6a82fb 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.07);
}
.chat-input button:hover {
  background: linear-gradient(90deg, #0056b3 0%, #6a82fb 100%);
}
</style>
