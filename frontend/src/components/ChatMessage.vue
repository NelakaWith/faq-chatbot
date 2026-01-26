<template>
  <div :class="['message', message.sender]">
    <div class="avatar">
      <span v-if="message.sender === 'bot'">🤖</span>
      <span v-else>🧑</span>
    </div>
    <div class="message-content">
      <div v-if="message.sender === 'bot'" class="markdown-body" v-html="sanitizedMarkdown"></div>
      <div v-else>{{ message.text }}</div>
      <div v-if="message.source" class="message-source">
        {{ message.source }}
      </div>
      <div v-if="message.model" class="message-model">
        🤖 {{ message.model }}
      </div>
      <!-- Button suggestions for fallback scenarios -->
      <div
        v-if="message.buttonSuggestions && message.buttonSuggestions.length > 0"
        class="suggestion-buttons"
      >
        <button
          v-for="(suggestion, suggestionIndex) in message.buttonSuggestions"
          :key="suggestionIndex"
          @click="$emit('suggestion-click', suggestion)"
          class="suggestion-btn"
        >
          {{ suggestion.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Define component props
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

// Define emitted events
defineEmits(["suggestion-click"]);

// Computed property to sanitize markdown content
const sanitizedMarkdown = computed(() => {
  if (!props.message.text) return "";
  try {
    const rawHtml = marked(props.message.text);
    return DOMPurify.sanitize(rawHtml);
  } catch (e) {
    console.error("Markdown parsing error:", e);
    return props.message.text;
  }
});
</script>

<style>
/* Basic styles for markdown content in chat messages */
.markdown-body {
  font-size: 1rem;
  line-height: 1.5;
}

.markdown-body p {
  margin-bottom: 0.5em;
}

.markdown-body p:last-child {
  margin-bottom: 0;
}

.markdown-body ul,
.markdown-body ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-body li {
  margin-bottom: 0.25em;
}

.markdown-body code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  background-color: #f6f8fa;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 3px solid #dfe2e5;
  color: #6a737d;
  padding-left: 1em;
  margin: 0.5em 0;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

/* Ensure parsed content inherits color from parent for user/bot distinction if needed */
.message.user .markdown-body {
  color: white;
}
.message.bot .markdown-body {
  color: #222;
}

/* Adjust code block colors for user messages (blue background) */
.message.user .markdown-body code {
  background-color: rgba(255, 255, 255, 0.2);
}
.message.user .markdown-body pre {
  background-color: rgba(0, 0, 0, 0.1);
  color: #f8f8f8;
}
.message.user .markdown-body a {
  color: #e6f2ff;
}
</style>
