<template>
  <div class="chat-widget">
    <ChatHeader
      :chatMode="chatMode"
      :modelName="getModelDisplayName()"
      @toggle-mode="toggleChatMode"
      @clear-chat="handleClearChat"
    />

    <FileUpload
      v-if="chatMode === 'kb'"
      :isLoading="isLoading"
      @file-selected="handleFileSelected"
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

<script setup>
import { nextTick } from "vue";
import { useChat } from "../composables";
import ChatHeader from "./ChatHeader.vue";
import ChatMessages from "./ChatMessages.vue";
import ChatInput from "./ChatInput.vue";
import FileUpload from "./FileUpload.vue";

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
  currentDocument,
  uploadFile
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

const handleFileSelected = async (file) => {
  await uploadFile(file);
};

const toggleChatMode = () => {
  // Cycle modes: faq -> llm -> kb -> faq
  let newMode = "faq";
  if (chatMode.value === "faq") newMode = "llm";
  else if (chatMode.value === "llm") newMode = "kb";
  else if (chatMode.value === "kb") newMode = "faq";

  switchMode(newMode);
};

const handleClearChat = () => {
  clearMessages();
};

const getModelDisplayName = () => {
  if (chatMode.value === "llm") {
    // Get the last bot message with a model
    const lastBotMessage = [...messages.value]
      .reverse()
      .find((m) => m.sender === "bot" && m.model);
    return lastBotMessage?.model || "";
  }
  return "";
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
</script>
