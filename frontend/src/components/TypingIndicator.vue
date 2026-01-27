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

<script setup>
import { computed } from "vue";

// Define component properties
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  chatMode: {
    type: String,
    required: true,
    validator: (value) => ["faq", "llm", "kb"].includes(value),
  },
});

// Computed properties for display logic
const isVisible = computed(() => {
  return props.isLoading;
});

const typingText = computed(() => {
  if (props.chatMode === "kb") return "Analyzing document";
  return props.chatMode === "llm"
    ? "AI is thinking"
    : "Searching knowledge base";
});

const icon = computed(() => {
  if (props.chatMode === "kb") return "📄";
  return props.chatMode === "llm" ? "🧠" : "🔍";
});

const iconClass = computed(() => {
  if (props.chatMode === "kb") return "search-pulse";
  return props.chatMode === "llm" ? "brain-pulse" : "search-pulse";
});

const processingText = computed(() => {
  if (props.chatMode === "kb") return "Reading content...";
  return props.chatMode === "llm"
    ? "Processing your request..."
    : "Looking for answers...";
});
</script>
