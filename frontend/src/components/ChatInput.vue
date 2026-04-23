<template>
  <div class="chat-input">
    <input
      v-model="inputMessage"
      @keyup.enter="handleSendMessage"
      :placeholder="isLoading ? 'Processing...' : 'Type your message...'"
      :disabled="isLoading"
      autocomplete="off"
      aria-label="Chat message input"
    />
    <button
      @click="handleSendMessage"
      :disabled="isLoading || !inputMessage.trim()"
      aria-label="Send message"
    >
      <svg
        v-if="!isLoading"
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 24 24"
        class="loading-spinner"
      >
        <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Define component props
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

// Define emitted events
const emit = defineEmits(["send-message"]);

// Reactive state for input
const inputMessage = ref("");

// Method to handle sending messages
const handleSendMessage = () => {
  if (!inputMessage.value.trim() || props.isLoading) return;

  const message = inputMessage.value;
  inputMessage.value = "";
  emit("send-message", message);
};
</script>
