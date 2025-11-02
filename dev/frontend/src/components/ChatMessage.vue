<template>
  <div :class="['message', message.sender]">
    <div class="avatar">
      <span v-if="message.sender === 'bot'">🤖</span>
      <span v-else>🧑</span>
    </div>
    <div class="message-content">
      {{ message.text }}
      <div v-if="message.source" class="message-source">
        {{ message.source }}
      </div>
      <div v-if="message.model" class="message-model">
        🤖 {{ message.model }}
      </div>
      <div v-if="message.usage" class="message-usage">
        📊 {{ message.usage.totalTokens }} tokens ({{
          message.usage.promptTokens
        }}+{{ message.usage.completionTokens }})
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

<script>
export default {
  name: "ChatMessage",
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  emits: ["suggestion-click"],
};
</script>
