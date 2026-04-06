# DeClerk UI — Frontend

A Vue 3 frontend for the DeClerk application. This small README explains how to run the development server, build for production, and where the main UI components live.

## Quick start

1. Install dependencies:

```powershell
cd frontend
npm install
```

2. Run the dev server (Vite):

```powershell
npm run dev
```

3. Build for production:

```powershell
npm run build
```

4. Preview production build (optional):

```powershell
npm run preview
```

## Project structure

- `src/`
  - `components/` — UI components (e.g., `ChatWidget.vue`)
  - `App.vue` — main app container
  - `main.js` — app bootstrap
- `index.html` — Vite entry
- `vite.config.js` — Vite configuration

## Configuration

- The frontend expects the backend API at `http://localhost:3000` by default. Update the API base URL in the frontend config or environment variables if needed.

## Default Chat Mode

- The default chat mode is now **LLM-powered chat** (`llm`). Users will start in LLM mode instead of the knowledge base search mode.
- This change requires a valid API key (e.g., OpenRouter, Gemini, or Groq) to be configured in the backend for the application to function on first launch.
- If no API key is set, users may see errors or the chat may not function until configuration is complete.

## Deploying

Build the static assets and serve them using your preferred static host or integrate with the backend to serve via Nginx or an Express static server.

## Links

- Back to repository README: `../README.md`
- Backend README: `../backend/README.md`
