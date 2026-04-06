# 🤖 DeClerk

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen?style=flat-square&logo=vercel)](https://declerk.nelaka.xyz/)
[![Deployment Status](https://img.shields.io/badge/Deployment-Active-success?style=flat-square&logo=github-actions)](https://github.com/NelakaWith/de-clerk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.0-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)

[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-FF6B6B?style=flat-square&logo=openai)](https://openrouter.ai/)
[![Fuse.js](https://img.shields.io/badge/Fuse.js-Search-orange?style=flat-square)](https://fusejs.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow?style=flat-square&logo=conventionalcommits)](https://conventionalcommits.org)

A modern AI-powered chatbot with intelligent knowledge base search and LLM integration, built with Vue 3 and Node.js.

## 🔗 Live Demo

**[Try the Live Demo](https://declerk.nelaka.xyz/)**

## 📋 Overview

This project demonstrates a full-stack chatbot application with dual operational modes:

- **Search Mode**: Intelligent search through structured knowledge bases with fuzzy matching
- **AI Assistant Mode**: OpenRouter API integration with Google Gemma 3 for conversational AI

Built as a technical showcase demonstrating modern web development practices, component architecture, and AI integration patterns.

## ✨ Key Features

### 🧠 Intelligent Search System

- **Multi-layered Search**: Exact match → Keyword detection → Fuzzy search → PDF fallback
- **Semantic Understanding**: Synonym handling and context-aware responses
- **PDF Processing**: Automatic document parsing and content extraction

### 🤖 AI Integration

- **OpenRouter API**: Integration with Google Gemma 3 model (free tier)
- **Conversation Management**: Stateful chat with conversation history
- **Mode Switching**: Seamless transition between FAQ and AI modes

### 🎨 Modern Frontend

- **Vue 3 Composition API**: Component-based architecture with reactive state
- **Real-time UI**: Typing indicators, loading states, and smooth animations
- **Responsive Design**: Mobile-first approach with elegant chat interface

### 🔧 Developer Experience

- **Hot Reload**: Development servers with live updates
- **Error Handling**: Comprehensive error boundaries and fallback responses
- **API Documentation**: Well-documented RESTful endpoints

## 🛠️ Tech Stack

### Frontend

- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API communication
- **CSS3** - Custom animations and responsive design

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Fuse.js** - Powerful fuzzy search library
- **PDF-Parse** - PDF text extraction utility

### AI & APIs

- **OpenRouter API** - LLM gateway service
- **Google Gemma 3** - Large language model (free tier)
- **REST Architecture** - Clean API design patterns

### DevOps & Tools

- **Git** - Version control with conventional commits
- **npm workspaces** - Monorepo dependency management
- **Environment Configuration** - Secure API key management

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- OpenRouter API key (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NelakaWith/de-clerk.git
   cd de-clerk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cd backend
   cp .env.example .env
   # Add your OPENROUTER_API_KEY to .env
   ```

4. **Start development servers**

   **Backend** (Terminal 1):

   ```bash
   cd backend
   npm run dev
   ```

   **Frontend** (Terminal 2):

   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/health

### Windows Quick Start

```cmd
# Run the included batch file
run-demo.bat
```

## 📚 Project Structure

```
declerk/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   ├── data/             # Knowledge base JSON files
│   └── server.js         # Entry point
├── frontend/             # Vue 3 SPA
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── composables/   # Reusable logic
│   │   └── styles/        # CSS modules
│   └── vite.config.js
├── documents/            # PDF knowledge base
├── .github/workflows/    # CI/CD automation
└── README.md
```

## 🧪 API Endpoints

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| `POST` | `/api/chat`     | Knowledge base search      |
| `POST` | `/api/chat/llm` | OpenRouter AI conversation |
| `GET`  | `/api/status`   | Service status and metrics |
| `GET`  | `/api/health`   | Health check endpoint      |

## 📖 Key Learnings

### Technical Implementation

- **Vue 3 Composables**: Learned reactive state management and composition patterns
- **API Integration**: Implemented secure proxy patterns for external API consumption
- **Search Algorithms**: Built multi-tier search with fallback strategies
- **Component Architecture**: Designed reusable, maintainable component structures

### Best Practices

- **Error Handling**: Implemented comprehensive error boundaries and user feedback
- **State Management**: Used reactive patterns for real-time UI updates
- **API Design**: Created RESTful endpoints with proper status codes and responses
- **Security**: Implemented environment-based configuration and API key protection

### Problem Solving

- **Performance**: Optimized search algorithms for large knowledge bases
- **User Experience**: Added loading states, animations, and contextual feedback
- **Scalability**: Designed modular architecture for easy feature expansion

## 🚧 Future Improvements

### Short-term Enhancements

- [ ] **Vector Search**: Implement semantic search with embeddings
- [ ] **User Authentication**: Add login/logout and conversation persistence
- [ ] **Chat History**: Save and restore previous conversations
- [ ] **File Upload**: Allow users to upload documents for analysis

### Advanced Features

- [ ] **Multi-model Support**: Add support for GPT-4, Claude, and other LLMs
- [ ] **Voice Integration**: Implement speech-to-text and text-to-speech
- [ ] **Admin Dashboard**: Content management interface for knowledge base
- [ ] **Analytics**: Usage tracking and conversation analytics

### Technical Improvements

- [ ] **Testing Suite**: Unit tests, integration tests, and E2E testing
- [ ] **Docker Deployment**: Containerization for easy deployment
- [ ] **CDN Integration**: Asset optimization and global distribution
- [ ] **Monitoring**: Application performance monitoring and alerting

## ⚠️ Default Chat Mode Change

- The default chat mode is now **LLM-powered chat** (`llm`).
- Users will start in LLM mode instead of the knowledge base search mode.
- Ensure you have configured a valid API key (OpenRouter, Gemini, or Groq) in your backend `.env` before first launch, or the chat may not function.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

## 👨‍💻 Author

**Nelaka Withanage**

- GitHub: [@NelakaWith](https://github.com/NelakaWith)
- Portfolio: [nelaka.xyz](https://nelaka.xyz/)
- LinkedIn: [in/nelaka-withanage/](https://www.linkedin.com/in/nelaka-withanage/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⭐ **Star this repository if you found it helpful!**

_Built with ❤️ using Express.js, Vue.js, and the Groq API_
