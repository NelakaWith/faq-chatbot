<template>
  <div class="llm-example">
    <h2>LLM Composable Examples</h2>

    <!-- Model Selection -->
    <div class="model-selector">
      <label for="model-select">Select Model:</label>
      <select id="model-select" v-model="selectedModel" @change="updateModel">
        <option
          v-for="model in llm.availableModels"
          :key="model.id"
          :value="model.id"
        >
          {{ model.name }} ({{ model.provider }})
        </option>
      </select>
    </div>

    <!-- Configuration Panel -->
    <div class="config-panel">
      <h3>Configuration</h3>
      <div class="config-grid">
        <div class="config-item">
          <label>Temperature: {{ llm.config.temperature }}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            v-model.number="llm.config.temperature"
          />
        </div>
        <div class="config-item">
          <label>Max Tokens: {{ llm.config.maxTokens }}</label>
          <input
            type="range"
            min="100"
            max="4000"
            step="100"
            v-model.number="llm.config.maxTokens"
          />
        </div>
      </div>
    </div>

    <!-- Quick Examples -->
    <div class="examples-section">
      <h3>Quick Examples</h3>
      <div class="example-buttons">
        <button
          @click="askQuestion('Explain Vue 3 composables in simple terms')"
          :disabled="llm.isLoading"
        >
          📚 Explain Vue 3 Composables
        </button>
        <button
          @click="askQuestion('Write a haiku about programming')"
          :disabled="llm.isLoading"
        >
          🎨 Write a Programming Haiku
        </button>
        <button
          @click="
            askQuestion(
              'Help me debug this JavaScript error: Cannot read property of undefined'
            )
          "
          :disabled="llm.isLoading"
        >
          🔧 Debug JavaScript Error
        </button>
        <button @click="startConversation()" :disabled="llm.isLoading">
          💬 Start Conversation
        </button>
      </div>
    </div>

    <!-- Custom Input -->
    <div class="custom-input">
      <h3>Custom Message</h3>
      <div class="input-group">
        <textarea
          v-model="customMessage"
          placeholder="Enter your custom message..."
          rows="3"
          :disabled="llm.isLoading"
        ></textarea>
        <button
          @click="sendCustomMessage"
          :disabled="llm.isLoading || !customMessage.trim()"
        >
          Send Message
        </button>
      </div>
    </div>

    <!-- Response Display -->
    <div v-if="llm.lastResponse || llm.error" class="response-section">
      <h3>Response</h3>

      <!-- Loading State -->
      <div v-if="llm.isLoading" class="loading">
        <div class="spinner"></div>
        <span>Generating response...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="llm.error" class="error">
        <strong>Error:</strong> {{ llm.error }}
      </div>

      <!-- Success Response -->
      <div v-else-if="llm.lastResponse" class="response">
        <div class="response-content">
          {{
            llm.lastResponse.choices?.[0]?.message?.content ||
            "No content received"
          }}
        </div>

        <div v-if="llm.getUsage()" class="usage-info">
          <strong>Usage:</strong>
          Prompt: {{ llm.getUsage().prompt_tokens }} tokens, Completion:
          {{ llm.getUsage().completion_tokens }} tokens, Total:
          {{ llm.getUsage().total_tokens }} tokens
        </div>

        <div class="response-meta">
          <small>
            Model: {{ llm.lastResponse.model || llm.config.model }} | Finish
            Reason: {{ llm.lastResponse.choices?.[0]?.finish_reason || "N/A" }}
          </small>
        </div>
      </div>
    </div>

    <!-- Conversation History -->
    <div v-if="conversationMessages.length > 0" class="conversation-history">
      <h3>Conversation History</h3>
      <div class="conversation-messages">
        <div
          v-for="(msg, index) in conversationMessages"
          :key="index"
          :class="['conv-message', msg.role]"
        >
          <strong>{{ msg.role }}:</strong> {{ msg.content }}
        </div>
      </div>
      <button @click="clearConversation" class="clear-btn">
        Clear Conversation
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useChatLLM } from "../composables";

export default {
  name: "LLMExample",
  setup() {
    const llm = useChatLLM();
    const customMessage = ref("");
    const selectedModel = ref(llm.config.model);
    const conversationMessages = ref([]);

    const updateModel = () => {
      llm.updateConfig({ model: selectedModel.value });
    };

    const askQuestion = async (question) => {
      try {
        const response = await llm.sendTextMessage(question);
        console.log("Response:", response);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const sendCustomMessage = async () => {
      if (!customMessage.value.trim()) return;

      try {
        const message = customMessage.value.trim();
        customMessage.value = "";

        const response = await llm.sendTextMessage(message);
        console.log("Custom message response:", response);
      } catch (error) {
        console.error("Error sending custom message:", error);
      }
    };

    const startConversation = async () => {
      const messages = [
        {
          role: "user",
          content:
            "Hello! I'd like to have a conversation about web development.",
        },
      ];

      try {
        conversationMessages.value = [...messages];
        const response = await llm.sendMessage(messages);

        if (response.choices?.[0]?.message) {
          conversationMessages.value.push(response.choices[0].message);
        }
      } catch (error) {
        console.error("Error starting conversation:", error);
      }
    };

    const continueConversation = async (newMessage) => {
      try {
        conversationMessages.value.push({ role: "user", content: newMessage });
        const response = await llm.continueConversation(
          conversationMessages.value.slice(0, -1),
          newMessage
        );

        if (response.choices?.[0]?.message) {
          conversationMessages.value.push(response.choices[0].message);
        }
      } catch (error) {
        console.error("Error continuing conversation:", error);
      }
    };

    const clearConversation = () => {
      conversationMessages.value = [];
    };

    return {
      llm,
      customMessage,
      selectedModel,
      conversationMessages,
      updateModel,
      askQuestion,
      sendCustomMessage,
      startConversation,
      continueConversation,
      clearConversation,
    };
  },
};
</script>

<style scoped>
.llm-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.model-selector {
  margin-bottom: 20px;
}

.model-selector label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.model-selector select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.config-panel {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.config-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

.config-item input[type="range"] {
  width: 100%;
}

.examples-section {
  margin-bottom: 20px;
}

.example-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.example-buttons button {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.example-buttons button:hover:not(:disabled) {
  background: #0056b3;
}

.example-buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.custom-input {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
}

.input-group textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.input-group button {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-group button:hover:not(:disabled) {
  background: #218838;
}

.input-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.response-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #dc3545;
  font-weight: bold;
}

.response {
  border-left: 4px solid #007bff;
  padding-left: 15px;
}

.response-content {
  margin-bottom: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.usage-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.response-meta {
  font-size: 12px;
  color: #999;
}

.conversation-history {
  background: #e9ecef;
  padding: 20px;
  border-radius: 8px;
}

.conversation-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.conv-message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
}

.conv-message.user {
  background: #cce5ff;
  margin-left: 20px;
}

.conv-message.assistant {
  background: #d4edda;
  margin-right: 20px;
}

.clear-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #c82333;
}
</style>
