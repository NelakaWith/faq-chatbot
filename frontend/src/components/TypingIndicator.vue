<template>
  <div v-if="isVisible" class="typing-indicator">
    <div class="typing-message">
      <div class="avatar">
        <span>🤖</span>
      </div>
      <div class="typing-content">
        <div class="typing-text">
          {{ typingText }}
          <span class="dots">
            <span class="dot dot-1">.</span>
            <span class="dot dot-2">.</span>
            <span class="dot dot-3">.</span>
          </span>
        </div>
        <div class="thinking-indicator">
          <div :class="iconClass">{{ icon }}</div>
          <div class="processing-text">{{ processingText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TypingIndicator",
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    chatMode: {
      type: String,
      required: true,
      validator: (value) => ["faq", "llm"].includes(value),
    },
  },
  computed: {
    isVisible() {
      return this.isLoading;
    },
    typingText() {
      return this.chatMode === "llm"
        ? "AI is thinking"
        : "Searching knowledge base";
    },
    icon() {
      return this.chatMode === "llm" ? "🧠" : "🔍";
    },
    iconClass() {
      return this.chatMode === "llm" ? "brain-pulse" : "search-pulse";
    },
    processingText() {
      return this.chatMode === "llm"
        ? "Processing your request..."
        : "Looking for answers...";
    },
  },
};
</script>
