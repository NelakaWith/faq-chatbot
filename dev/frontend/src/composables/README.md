# Chat Composables Documentation

This document explains how to use the chat composables created for the FAQ Chatbot frontend.

## Overview

The composables provide a clean, reusable way to interact with both the local FAQ search system and external LLM services through our backend proxy. Currently, we use the **Google Gemma 3 27B Instruct** model for LLM functionality.

## Available Composables

### 1. `useChatLLM()`

A composable for direct interaction with LLM services (OpenRouter API) through our backend using the Google Gemma model.

#### Basic Usage

```javascript
import { useChatLLM } from "@/composables";

export default {
  setup() {
    const llm = useChatLLM();

    const askQuestion = async () => {
      try {
        const response = await llm.sendTextMessage("Explain Vue 3 composables");
        console.log(response); // The text response from the AI
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    return { llm, askQuestion };
  },
};
```

#### Advanced Usage with Configuration

```javascript
const llm = useChatLLM();

// Update model configuration (temperature, max tokens, etc.)
llm.updateConfig({
  temperature: 0.8,
  maxTokens: 2000,
});

// Send message with options
const response = await llm.sendMessage("Hello!", {
  temperature: 0.5,
});

// Continue a conversation
const messages = [
  { role: "user", content: "Hello" },
  { role: "assistant", content: "Hi! How can I help?" },
];
const response = await llm.continueConversation(messages, "Tell me about AI");
```

#### Available Properties

- `isLoading` - Boolean indicating if a request is in progress
- `error` - Last error message (null if no error)
- `lastResponse` - Full response object from last request
- `config` - Current configuration (reactive)
- `availableModels` - Array of supported models

#### Available Methods

- `sendMessage(messages, options)` - Send messages to LLM
- `sendTextMessage(text, options)` - Send simple text and get response
- `continueConversation(history, newMessage, options)` - Continue conversation
- `updateConfig(newConfig)` - Update configuration
- `resetConfig()` - Reset to defaults
- `getUsage()` - Get token usage from last response

### 2. `useChat()`

A unified composable that handles both FAQ search and LLM functionality with message management.

#### Basic Usage

```javascript
import { useChat } from "@/composables";

export default {
  setup() {
    const {
      messages,
      isLoading,
      chatMode,
      sendMessage,
      switchMode,
      clearMessages,
    } = useChat();

    const handleUserInput = async (text) => {
      await sendMessage(text);
    };

    const toggleMode = () => {
      const newMode = chatMode.value === "faq" ? "llm" : "faq";
      switchMode(newMode);
    };

    return {
      messages,
      isLoading,
      chatMode,
      handleUserInput,
      toggleMode,
      clearMessages,
    };
  },
};
```

#### Chat Modes

- **FAQ Mode** (`'faq'`): Searches local knowledge base
- **LLM Mode** (`'llm'`): Uses AI assistant with conversation history

#### Message Structure

Messages have the following structure:

```javascript
{
  id: 'unique-id',
  sender: 'user' | 'bot',
  text: 'message content',
  timestamp: '2024-01-01T00:00:00.000Z',
  mode: 'faq' | 'llm',

  // FAQ-specific fields
  source: '📚 document.pdf',
  sourceType: 'document' | 'fallback' | 'error',
  buttonSuggestions: [
    { text: 'Ask something', action: 'ask', value: 'question' }
  ],

  // LLM-specific fields
  model: 'google/gemma-3-27b-it:free',
  usage: {
    promptTokens: 100,
    completionTokens: 150,
    totalTokens: 250
  }
}
```

#### Available Properties

- `messages` - Array of all chat messages
- `isLoading` - Boolean indicating if processing
- `chatMode` - Current mode ('faq' or 'llm')
- `conversationHistory` - LLM conversation history
- `hasMessages` - Computed boolean
- `lastMessage` - Computed last message
- `llm` - Access to underlying LLM composable

#### Available Methods

- `sendMessage(text, options)` - Send message (routes to appropriate handler)
- `sendFAQMessage(text)` - Force FAQ mode message
- `sendLLMMessage(text, options)` - Force LLM mode message
- `switchMode(mode)` - Switch between 'faq' and 'llm'
- `clearMessages()` - Clear all messages
- `handleSuggestion(suggestion)` - Handle button clicks
- `getConversationSummary()` - Export conversation data
- `loadConversation(data)` - Import conversation data

## Examples

### Simple FAQ Chat

```javascript
import { useChat } from "@/composables";

const { messages, sendMessage, isLoading } = useChat();

// Will use FAQ search (default mode)
await sendMessage("How do I reset my password?");
```

### AI Assistant Chat

```javascript
import { useChat } from "@/composables";

const chat = useChat();

// Switch to LLM mode
chat.switchMode("llm");

// Now messages will use AI assistant
await chat.sendMessage("Explain quantum computing in simple terms");
```

### Model Configuration

```javascript
import { useChat } from "@/composables";

const { llm, sendMessage, switchMode } = useChat();

// Configure the LLM (Gemma model is used by default)
llm.updateConfig({
  temperature: 0.9,
  maxTokens: 1500,
});

switchMode("llm");
await sendMessage("Write a creative story about a robot");
```

### Handling Responses

```vue
<template>
  <div>
    <div v-for="msg in messages" :key="msg.id" :class="msg.sender">
      {{ msg.text }}

      <!-- Show source for FAQ messages -->
      <div v-if="msg.source" class="source">{{ msg.source }}</div>

      <!-- Show model and usage for LLM messages -->
      <div v-if="msg.model" class="model">{{ msg.model }}</div>
      <div v-if="msg.usage" class="usage">
        {{ msg.usage.totalTokens }} tokens
      </div>

      <!-- Handle suggestions -->
      <button
        v-for="suggestion in msg.buttonSuggestions"
        :key="suggestion.text"
        @click="handleSuggestion(suggestion)"
      >
        {{ suggestion.text }}
      </button>
    </div>
  </div>
</template>
```

## Configuration

### Environment Variables

Ensure your `.env` file has:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend Requirements

The composables expect these backend endpoints:

- `POST /api/chat` - FAQ search
- `POST /api/chat/llm` - LLM proxy (OpenRouter)

## Error Handling

All composables include comprehensive error handling:

```javascript
const { error, sendMessage } = useChat();

try {
  await sendMessage("Hello");
} catch (err) {
  console.error("Chat error:", err.message);
  // Error is also available in error.value
}
```

## TypeScript Support

For TypeScript projects, you can create type definitions:

```typescript
interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  mode: "faq" | "llm";
  source?: string;
  sourceType?: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

## Best Practices

1. **Error Handling**: Always wrap composable calls in try-catch blocks
2. **Loading States**: Use `isLoading` to show appropriate UI feedback
3. **Mode Switching**: Inform users when switching between FAQ and LLM modes
4. **Token Usage**: Monitor `usage` information for cost tracking
5. **Configuration**: Set appropriate `temperature` and `maxTokens` for your use case
6. **Conversation Management**: Use `clearMessages()` for new conversations

## Troubleshooting

### Common Issues

1. **"Network Error"**: Check if backend is running and VITE_API_BASE_URL is correct
2. **"API key not configured"**: Ensure OPENROUTER_API_KEY is set in backend .env
3. **"Rate limit exceeded"**: Wait before making more requests or upgrade API plan
4. **Empty responses**: Check model configuration and request format

### Debug Mode

Enable debug logging:

```javascript
const { sendMessage } = useChat();

// Check network requests in browser dev tools
await sendMessage("test message");
```
