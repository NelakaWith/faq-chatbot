# FAQ Chatbot

A sophisticated Node.js chatbot with fuzzy search capabilities, PDF document processing, and multi-source knowledge base integration.

## Project Structure

```
faq-chatbot/
├── .git/                  # Git repository
├── .gitignore             # Git ignore rules
├── documents/             # PDF documents for knowledge base
│   └── doc01.pdf          # TRESA legislation document
├── dev/
│   ├── backend/           # Node.js + Express API server
│   │   ├── .gitignore     # Backend-specific ignore rules
│   │   ├── data/          # JSON knowledge base files
│   │   │   ├── faq.json   # Frequently asked questions
│   │   │   ├── legal.json # Legal information
│   │   │   └── misc.json  # Greetings and miscellaneous
│   │   ├── src/           # Source code (controllers, routes, services, utils)
│   │   │   ├── app.js     # Express app configuration
│   │   │   ├── controllers/
│   │   │   │   └── chatController.js
│   │   │   ├── routes/
│   │   │   │   └── chatRoutes.js
│   │   │   ├── services/
│   │   │   │   ├── dataService.js
│   │   │   │   └── searchService.js
│   │   │   └── utils/
│   │   │       ├── formatters.js
│   │   │       └── pdfReader.js
│   │   ├── server.js       # Main entry point
│   │   ├── package.json    # Dependencies & scripts
│   │   ├── README.md       # Backend documentation
│   │   └── nodemon.json    # Development configuration
│   └── frontend/           # Vue 3 frontend
│       ├── src/
│       │   ├── components/
│       │   │   └── ChatWidget.vue
│       │   ├── App.vue
│       │   └── main.js
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
├── run-demo.bat           # Windows batch script
└── README.md              # This file
```

Quick links:

- Backend README: [dev/backend/README.md](dev/backend/README.md)
- Frontend README: [dev/frontend/README.md](dev/frontend/README.md)

## Features

- **Multi-Source Knowledge Base**: FAQ, legal documents, miscellaneous responses, and PDF content
- **Intelligent Search Priority**: Exact matches → keyword detection → fuzzy search → PDF fallback
- **PDF Document Processing**: Automatic text extraction and chunking for searchable content
- **Enhanced Keyword Matching**: Handles synonyms and related terms (e.g., "effective date" → "come into effect")
- **Fuzzy Search**: Powered by Fuse.js with configurable thresholds
- **RESTful API**: Clean Express.js API with proper error handling
- **Vue 3 Frontend**: Modern chat interface with real-time responses
- **Graceful Error Handling**: Comprehensive error handling and fallback responses

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
- `npm run clean` - Clean temporary files

## API Endpoints

### POST /chat

Process a chat message and return the best matching response.

**Request:**

```json
{
  "message": "TRESA effective date"
}
```

**Response:**

```json
{
  "response": "TRESA came into effect on December 1, 2023, replacing the Real Estate and Business Brokers Act (REBBA).",
  "source": "FAQ Database - Keyword Match",
  "sourceType": "faq"
}
```

### GET /status

Get server status and data source information.

**Response:**

```json
{
  "status": "running",
  "initialized": true,
  "dataSources": {
    "faq": 10,
    "legal": 10,
    "misc": 12,
    "pdfs": 1,
    "totalSearchable": 100
  }
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "FAQ Chatbot API"
}
```

## URLs

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:3000/health
- **API Status**: http://localhost:3000/status

# FAQ Chatbot (developer guide)

This repository contains a Node.js backend and a Vue 3 frontend that together implement a FAQ chatbot with fuzzy search and PDF fallback search.

## Quick overview

- Backend: `dev/backend` (Express)
- Frontend: `dev/frontend` (Vue 3)
- Release automation: `semantic-release` (configured in `.releaserc`)
- CI: GitHub Actions (`.github/workflows`)
- Commit rules: Conventional Commits enforced by `commitlint` + Husky and a PR check

## Quick start (dev)

1. Clone and install dependencies at the repo root (monorepo workspaces):

```powershell
cd D:\Projects\Samples\faq-chatbot
npm install
```

2. Start backend and frontend in separate terminals:

Backend:

```powershell
cd dev/backend
npm install
npm run dev
```

Frontend:

```powershell
cd dev/frontend
npm install
npm run dev
```

## Commit conventions & tools

We use Conventional Commits to drive releases via `semantic-release`. The repo already includes these conveniences:

- Commitizen: run `npm run commit` to get an interactive commit prompt (`cz-conventional-changelog`).
- Commitlint: validates commit messages in CI and locally.
- Husky: local `commit-msg` hook runs `commitlint` to block bad commits before pushing.

If you haven't already, run `npm install` at the repo root to ensure hooks and dev tools are available. Use `git commit` as usual, or `npm run commit` for guided commits.

Example valid commit:

```
chore: Refactor code structure for improved readability and maintainability
```

## CI / release

- Releases are automated with `semantic-release` from the `main` branch. The `release.yml` workflow runs `semantic-release` on `main` and creates GitHub Releases and updates `CHANGELOG.md`.
- You can run a local dry-run to preview a release without publishing:

```powershell
npx semantic-release --dry-run
```

Note: `npm ci` in CI requires `package-lock.json` to match `package.json`. If CI reports `EUSAGE` about `npm ci`, run `npm install` locally, commit the updated lockfile, and push.

## Deploy workflow

The deploy workflow (`.github/workflows/deploy.yml`) runs on manual dispatch only (workflow_dispatch). Behavior:

- Trigger: manually from GitHub Actions (Actions → Deploy → Run workflow). It accepts an optional `tag` input.
- If `tag` is provided: the workflow deploys that tag/ref.
- If `tag` is empty: the workflow looks up the latest GitHub Release tag and deploys that tag.
- The workflow creates a GitHub Deployment record, copies files to your droplet via SCP, runs deploy commands via SSH (pm2 restart / build / nginx copy), then posts deployment status back to GitHub.

If you want automatic deploys on release publish, we can add `on: release: types: [published]` to the workflow.

## PR checks

- `pr-commitlint.yml` runs on PRs and checks:
  - PR title (must follow Conventional Commits)
  - All non-merge commits in the PR via `commitlint` (merge commits are ignored)

## Husky notes

- Husky is initialized via `prepare` script in `package.json` (runs on `npm install`).
- Local hook file `.husky/commit-msg` runs `commitlint` to validate commit messages. If the commit message is invalid the commit will be blocked.
- To add pre-commit formatting/linting, we can add `lint-staged` and a `.husky/pre-commit` hook.

## Troubleshooting & tips

- If CI fails with `npm ci` lockfile mismatch: run `npm install` locally and commit `package-lock.json`.
- To bypass hooks (not recommended): `git commit --no-verify -m "..."`.
- If Husky hooks don't run for other contributors, ensure they run `npm install` so the `prepare` script sets up Husky helper files.

## Contributing

1. Fork the repo and create a feature branch
2. Use `npm run commit` (Commitizen) or follow Conventional Commits for commit messages
3. Open a PR; CI will run commitlint and other checks

## Where to look

- Release config: `.releaserc`
- Release workflow: `.github/workflows/release.yml`
- Deploy workflow: `.github/workflows/deploy.yml`
- PR commit checks: `.github/workflows/pr-commitlint.yml`
- Husky hook: `.husky/commit-msg`
- Commitlint config: `commitlint.config.js`

---
