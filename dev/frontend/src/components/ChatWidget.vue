<template>
  <div class="chat-widget">
    <div class="chat-header">
      <span class="chat-title">🤖 FAQ Chatbot</span>
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
        placeholder="Type your message..."
        autocomplete="off"
      />
      <button @click="sendMessage">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from "vue";

export default {
  name: "ChatWidget",
  setup() {
    const messages = ref([]);
    const inputMessage = ref("");
    const messagesContainer = ref(null);

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return;

      messages.value.push({ sender: "user", text: inputMessage.value });
      const userMessage = inputMessage.value;
      inputMessage.value = "";

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
        const response = await fetch(`${apiBaseUrl}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });
        const data = await response.json();

        messages.value.push({
          sender: "bot",
          text: data.response,
          source: data.source ? `📚 ${data.source}` : null,
          sourceType: data.sourceType,
          buttonSuggestions: data.buttonSuggestions || null,
        });

        // push bot response
      } catch (error) {
        messages.value.push({
          sender: "bot",
          text: "Sorry, there was an error connecting to the server.",
        });
      }

      nextTick(() => {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      });
    };

    const handleSuggestionClick = (suggestion) => {
      if (suggestion.action === "ask") {
        inputMessage.value = suggestion.value;
        sendMessage();
      }
    };

    return {
      messages,
      inputMessage,
      sendMessage,
      messagesContainer,
      handleSuggestionClick,
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
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
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
