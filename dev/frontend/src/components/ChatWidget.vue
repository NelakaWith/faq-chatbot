<template>
  <div class="chat-widget">
    <ChatHeader
      :chatMode="chatMode"
      @toggle-mode="toggleChatMode"
      @clear-chat="handleClearChat"
    />

    <ChatMessages
      :messages="messages"
      :isLoading="isLoading"
      :chatMode="chatMode"
      @suggestion-click="handleSuggestionClick"
    />

    <ChatInput :isLoading="isLoading" @send-message="handleSendMessage" />
  </div>
</template>

<script>
import { nextTick } from "vue";
import { useChat } from "../composables";
import ChatHeader from "./ChatHeader.vue";
import ChatMessages from "./ChatMessages.vue";
import ChatInput from "./ChatInput.vue";

export default {
  name: "ChatWidget",
  components: {
    ChatHeader,
    ChatMessages,
    ChatInput,
  },
  setup() {
    // Use the chat composable
    const {
      messages,
      isLoading,
      chatMode,
      sendMessage,
      handleSuggestion,
      switchMode,
      clearMessages,
      addBotMessage,
      llm,
    } = useChat();

    const handleSendMessage = async (message) => {
      await sendMessage(message);
    };

    const handleSuggestionClick = async (suggestion) => {
      if (suggestion.action === "ask") {
        await sendMessage(suggestion.value);
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

    // Initialize with a welcome message from the bot
    if (messages.value.length === 0) {
      nextTick(() => {
        addBotMessage("Welcome! How can I help you today?", {
          sourceType: "system",
          mode: chatMode.value,
        });
      });
    }

    return {
      messages,
      isLoading,
      chatMode,
      llm,
      handleSendMessage,
      handleSuggestionClick,
      toggleChatMode,
      handleClearChat,
    };
  },
};
</script>
