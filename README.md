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

**Advanced AI-powered Legal RAG & Multi-Provider Chatbot**

DeClerk is a sophisticated full-stack chatbot solution designed for enterprise-grade Retrieval-Augmented Generation (RAG). It features deep structural analysis of PDF documents, semantic vector search with `pgvector`, and a multi-provider AI engine supporting Gemini, Groq, and OpenRouter.

## 🔗 Live Demo

**[Explore DeClerk Live](https://declerk.nelaka.xyz/)**

## 📋 Overview

DeClerk goes beyond simple keyword matching. It implements a multi-layered approach to information retrieval and conversation:

- **Intelligent RAG**: Semantic search using `pgvector` and local embedding generation with Transformers.js.
- **Structural PDF Analysis**: Automatically detects "Parts" and "Chapters" in complex (e.g., legal) documents for contextual responses.
- **Multi-Provider AI**: Seamlessly switch between Google Gemini 1.5, Groq (Llama 3/Mixtral), or OpenRouter models.
- **Fuzzy Search Fallback**: High-performance local search using Fuse.js for exact and near-match queries.

Built with modern web standards, DeClerk demonstrates production-ready patterns for AI integration, document processing, and reactive UI design.

## ✨ Key Features

### 🧠 Advanced RAG System

- **Vector search**: Deep semantic understanding using `pgvector` on Neon PostgreSQL.
- **Local Embeddings**: Privacy-focused embedding generation using `@xenova/transformers`.
- **Structural Awareness**: Extracts hierarchical information (Chapter/Section) from PDFs to provide precise citations.
- **Smart Chunking**: Semantically-aware text splitting with overlap for better context preservation.

### 🤖 Multi-Provider AI Engine

- **Google Gemini**: Integration with Gemini 1.5 Pro/Flash for high-reasoning tasks.
- **Groq API**: Blazing fast responses using Llama 3 and Mixtral models.
- **OpenRouter**: Unified access point for a wide range of open-source LLMs.
- **Stateful Chats**: Persistent conversation history for context-aware interactions.

### 🎨 Premium Frontend

- **Vue 3 Composition API**: Modular, reactive component architecture.
- **Dynamic File Uploads**: Real-time PDF processing and indexing via the UI.
- **Rich Interaction**: Fluid typing indicators, markdown rendering, and smooth transitions.
- **Responsive Mastery**: Tailored experiences for both desktop and mobile users.

### 🔧 Developer First

- **Scalable Architecture**: Clean separation of services, controllers, and database layers.
- **Automated Schema**: Self-initializing database tables and vector extensions on startup.
- **Health Monitoring**: Built-in endpoints for service metrics and connectivity status.

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Framework with Composition API
- **Vite** - Modern frontend tooling
- **Axios** - Promise-based HTTP client
- **CSS3/Animations** - Custom-crafted premium aesthetics

### Backend
- **Node.js & Express** - Efficient server-side runtime and framework
- **Neon / PostgreSQL** - Serverless database with `pgvector` support
- **Fuse.js** - Lightweight fuzzy search for local data
- **PDF-parse** - Robust PDF text extraction

### AI & Embeddings
- **Gemini API** - Google's latest generative models
- **Groq API** - Low-latency LLM inference
- **Transformers.js** - Local ML for embedding generation
- **OpenRouter** - Aggregated AI model gateway

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Neon.tech** account (or any PostgreSQL with `pgvector`)
- One or more AI API Keys (Gemini, Groq, or OpenRouter)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NelakaWith/de-clerk.git
   cd de-clerk
   ```

2. **Install all dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Navigate to the `backend` directory and create your `.env` file:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Add your credentials to `.env`:
   - `NEON_DATABASE_URL`: Your PostgreSQL connection string.
   - `GEMINI_API_KEY`: [Optional] Google AI Studio key.
   - `GROQ_API_KEY`: [Optional] Groq Console key.
   - `OPENROUTER_API_KEY`: [Optional] OpenRouter key.

4. **Launch Development Servers**

   **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access Application**
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **API Status**: [http://localhost:3000/health](http://localhost:3000/health)

### Windows Quick Launch
Simply execute the included batch file for a onend-click setup:
```cmd
run-demo.bat
```

## 📚 Project Structure

```bash
declerk/
├── backend/               # Express.js Server
│   ├── src/
│   │   ├── controllers/   # Request logic handlers
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # RAG, Search, and AI logic
│   │   └── db/            # Database schema & connection
│   └── data/              # Default JSON knowledge bases
├── frontend/              # Vue 3 Application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   └── composables/   # Shared reactive logic
├── documents/             # Storage for local PDF sources
├── scripts/               # Maintenance and utility scripts
└── docker-compose.yml     # Containerization config
```

## 🧪 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Intelligent hybrid search query |
| `POST` | `/api/chat/llm` | Multi-model AI conversation |
| `POST` | `/api/rag/upload` | Upload and vectorize PDF document |
| `GET` | `/status` | Real-time service usage & metrics |
| `GET` | `/health` | System connectivity health check |

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

**Nelaka Withanage**

- GitHub: [@NelakaWith](https://github.com/NelakaWith)
- Portfolio: [nelaka.xyz](https://nelaka.xyz/)
- LinkedIn: [in/nelaka-withanage/](https://www.linkedin.com/in/nelaka-withanage/)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

⭐ **Star this repository if you found it helpful!**

_Built with excellence using Vue.js, Express.js, and next-gen AI._
