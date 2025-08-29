# Chatbot Demo

A JavaScript-based chatbot demo with fuzzy search capabilities.

## Project Structure

```
dev/
├─ backend/          # Node.js + Express server
│   ├─ data/
│   │   ├─ faq.json
│   │   └─ legal.json
│   ├─ server.js
│   └─ package.json
└─ frontend/         # Vue 3 frontend
    ├─ src/
    │   ├─ components/
    │   │   └─ ChatWidget.vue
    │   ├─ App.vue
    │   └─ main.js
    ├─ index.html
    ├─ vite.config.js
    └─ package.json
```

## Quick Start

### Option 1: Batch File (Windows)

Double-click `run-demo.bat` or run it from command prompt:

```cmd
run-demo.bat
```

### Option 2: PowerShell Script

Run the PowerShell script:

```powershell
.\run-demo.ps1
```

### Manual Setup

If you prefer to run manually:

1. **Backend** (Terminal 1):

   ```cmd
   cd dev\backend
   npm install
   npm run dev  # For development with hot reload
   # OR
   npm start    # For production
   ```

2. **Frontend** (Terminal 2):
   ```cmd
   cd dev\frontend
   npm install
   npm run dev
   ```

## Backend Scripts

- `npm run dev` - Development mode with hot reload using nodemon
- `npm run dev:debug` - Development mode with debugging enabled
- `npm start` - Production mode without hot reload

## URLs

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## Features

- Fuzzy search using Fuse.js
- FAQ and legal document search
- Vue 3 frontend with chat widget
- RESTful API with Express.js

## Testing

Try asking questions like:

- "What are your hours?"
- "How do I contact support?"
- "What is your refund policy?"
- "Tell me about payment terms"
