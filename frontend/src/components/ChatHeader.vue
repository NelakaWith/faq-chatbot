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
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 512 512"
        >
          <path
            fill="#fff"
            d="m320 192l-85.333-32L320 127.968l32-85.301l32.03 85.301L469.333 160l-85.303 32L352 277.333zM149.333 362.667L42.667 320l106.666-42.667L192 170.667l42.667 106.666L341.333 320l-106.666 42.667L192 469.333z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="#fff"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
          >
            <path
              d="M4.842 13.657V7.691A1.49 1.49 0 0 1 6.334 6.2h1.491m-2.983 4.474h2.237m3.13 2.983V7.691a1.492 1.492 0 1 1 2.983 0v5.966m-2.983-2.983h2.983m5.966 1.491a1.492 1.492 0 1 1-2.983 0V7.691a1.492 1.492 0 1 1 2.983 0zm-1.492 1.492l1.492 1.491"
            />
            <path
              d="M22.2 2.571H1.8A1.054 1.054 0 0 0 .75 3.625v13.588a1.054 1.054 0 0 0 1.05 1.054h2.443a7.8 7.8 0 0 1-1.386 3.16c3.05.044 4.98-1.136 6.138-3.16H22.2a1.054 1.054 0 0 0 1.054-1.054V3.625A1.054 1.054 0 0 0 22.2 2.571"
            />
          </g>
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
