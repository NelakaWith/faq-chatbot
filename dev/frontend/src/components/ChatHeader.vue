<template>
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
        @click="$emit('toggle-mode')"
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
        @click="$emit('clear-chat')"
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
</template>

<script>
export default {
  name: "ChatHeader",
  props: {
    chatMode: {
      type: String,
      required: true,
      validator: (value) => ["faq", "llm"].includes(value),
    },
  },
  emits: ["toggle-mode", "clear-chat"],
};
</script>
