<template>
  <div class="chat-header">
    <div class="chat-title-section">
      <span class="chat-title">🤖 {{ title }}</span>
      <div class="chat-mode-indicator">
        <span v-if="chatMode === 'kb'" class="mode-badge kb">
          📄 Knowledge Base
        </span>
        <span v-else class="mode-badge llm">
          🤖 AI Assistant
          <span v-if="modelName" class="model-name"> • {{ modelName }}</span>
        </span>
      </div>
    </div>
    <div class="chat-controls">
      <button
        @click="$emit('toggle-mode')"
        class="mode-toggle-btn"
        :title="
          chatMode === 'llm'
            ? 'Switch to Knowledge Base'
            : 'Switch to AI Assistant'
        "
      >
        <!-- LLM Mode: Brain/AI icon -->
        <svg
          v-if="chatMode === 'llm'"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            fill="#fff"
            d="M12 2a9 9 0 0 0-9 9c0 1.92.6 3.7 1.62 5.16L3 22l5.84-1.62A9 9 0 1 0 12 2m-2 13H8v-2h2zm4 0h-2v-2h2zm4 0h-2v-2h2zM8 9h2v2H8zm4 0h2v2h-2zm4 0h2v2h-2z"
          />
        </svg>

        <!-- KB Mode: Document/Book icon -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            fill="#fff"
            d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 2v16h12V4zm2 2h8v2H8zm0 4h8v2H8zm0 4h5v2H8z"
          />
        </svg>
      </button>
      <button
        @click="$emit('clear-chat')"
        class="clear-btn"
        title="Clear conversation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 14 14"
        >
          <g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="1">
            <path
              d="M3.932 7.962L6.922.6m4.183 12.79h2.28m-3.553-2.47h2.28M8.376 8.462h2.28"
            />
            <path
              stroke-linejoin="round"
              d="M6.421 10.217c0-1.392-1.398-2.133-2.33-2.232c-2.642-.28-3.521 2.03-3.473 3.969c.022.868.815 1.435 1.684 1.435h6.543c-.466 0-2.424-.94-2.424-3.172"
            />
          </g>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
// Define props for the ChatHeader component
// Using defineProps macro to declare props with validation
const props = defineProps({
  title: {
    type: String,
    default: "FAQ Chatbot",
  },
  chatMode: {
    type: String,
    required: true,
    validator: (value) => ["llm", "kb"].includes(value),
  },
  modelName: {
    type: String,
    default: "",
  },
});

// Define emitted events
// Using defineEmits macro to declare the events this component can emit
defineEmits(["toggle-mode", "clear-chat"]);
</script>
