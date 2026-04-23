<template>
  <div class="chat-messages" ref="messagesContainer">
    <transition-group name="fade" tag="div">
      <ChatMessage
        v-for="(message, index) in messages"
        :key="index"
        :message="message"
        @suggestion-click="$emit('suggestion-click', $event)"
      />
    </transition-group>

    <TypingIndicator :isLoading="isLoading" :chatMode="chatMode" />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import ChatMessage from "./ChatMessage.vue";
import TypingIndicator from "./TypingIndicator.vue";

// Define component properties
const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  chatMode: {
    type: String,
    required: true,
  },
});

// Define emitted events
defineEmits(["suggestion-click"]);

// Message container ref for scrolling
const messagesContainer = ref(null);
let scrollTimeout = null;

// Auto-scroll to bottom when messages change
watch(
  () => props.messages,
  () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
        }
      });
    }, 50);
  },
  { deep: true }
);
</script>
