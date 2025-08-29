<template>
  <div class="chat-widget">
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.sender]"
      >
        <div class="message-content">
          {{ msg.text }}
          <div v-if="msg.source" class="message-source">
            {{ msg.source }}
          </div>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        placeholder="Type your message..."
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from "vue";

export default {
  name: "ChatWidget",
  setup() {
    const messages = ref([]);
    const inputMessage = ref("");
    const messagesContainer = ref(null);

    const sendMessage = async () => {
      if (!inputMessage.value.trim()) return;

      messages.value.push({ sender: "user", text: inputMessage.value });
      const userMessage = inputMessage.value;
      inputMessage.value = "";

      try {
        const response = await fetch("http://localhost:3000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });
        const data = await response.json();
        messages.value.push({
          sender: "bot",
          text: data.response,
          source: data.source ? `📚 ${data.source}` : null,
          sourceType: data.sourceType,
        });
      } catch (error) {
        messages.value.push({
          sender: "bot",
          text: "Sorry, there was an error connecting to the server.",
        });
      }

      nextTick(() => {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      });
    };

    return {
      messages,
      inputMessage,
      sendMessage,
      messagesContainer,
    };
  },
};
</script>

<style scoped>
.chat-widget {
  border: 1px solid #ccc;
  border-radius: 8px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
}

.message.user {
  text-align: right;
}

.message.bot {
  text-align: left;
}

.message-content {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 18px;
  max-width: 70%;
}

.message-source {
  font-size: 0.8em;
  opacity: 0.7;
  margin-top: 4px;
  font-style: italic;
}

.message.user .message-content {
  background-color: #007bff;
  color: white;
}

.message.bot .message-content {
  background-color: #f1f1f1;
  color: black;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}

.chat-input button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #0056b3;
}
</style>
