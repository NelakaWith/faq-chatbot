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
/* Basic styles for markdown content in chat messages */
.markdown-body {
  font-size: 0.95rem;
  line-height: 1.6;
}

.markdown-body p {
  margin-bottom: 0.75em;
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
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: inherit;
}

.markdown-body pre {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75em 0;
  border: 1px solid rgba(255,255,255,0.05);
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  color: #e2e8f0;
}

.markdown-body blockquote {
  border-left: 3px solid var(--accent-primary, #3b82f6);
  color: var(--text-muted, #94a3b8);
  padding-left: 1em;
  margin: 0.75em 0;
  background: rgba(59, 130, 246, 0.05);
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
}

.markdown-body a {
  color: var(--accent-primary, #3b82f6);
  text-decoration: none;
  font-weight: 500;
}

.markdown-body a:hover {
  text-decoration: underline;
}

/* Ensure parsed content inherits color from parent for user/bot distinction */
.message.user .markdown-body {
  color: white;
}
.message.bot .markdown-body {
  color: var(--text-secondary, #cbd5e1);
}

/* Adjust code block colors for user messages */
.message.user .markdown-body code {
  background-color: rgba(255, 255, 255, 0.2);
}
.message.user .markdown-body pre {
  background-color: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}
.message.user .markdown-body a {
  color: #fff;
  text-decoration: underline;
}
.message.user .markdown-body blockquote {
  border-left-color: rgba(255,255,255,0.5);
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.1);
}
</style>
