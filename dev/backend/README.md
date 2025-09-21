# FAQ Chatbot Backend

A Node.js Express API for handling FAQ chatbot queries with PDF document support.

## Project Structure

```
dev/backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── controllers/
│   │   └── chatController.js  # Request handlers for chat endpoints
│   ├── routes/
│   │   └── chatRoutes.js      # Route definitions
│   ├── services/
│   │   ├── searchService.js   # Main search logic and Fuse.js integration
│   │   └── dataService.js     # Data loading and management
│   └── utils/
│       ├── pdfReader.js       # PDF text extraction utilities
│       └── formatters.js      # Response formatting utilities
├── data/
│   ├── faq.json              # FAQ questions and answers
│   ├── legal.json            # Legal information
│   └── misc.json             # Greetings and miscellaneous responses
├── server.js                 # Main server entry point
└── package.json              # Dependencies and scripts
```

## Features

- **Multi-source search**: FAQ, legal documents, miscellaneous responses, and PDF content
- **Intelligent search priority**: Exact matches → keyword detection → fuzzy search → fallback
- **PDF processing**: Automatic text extraction and chunking for searchable content
- **Enhanced keyword matching**: Handles synonyms and related terms
- **Graceful error handling**: Comprehensive error handling and fallback responses

## API Endpoints

### POST /chat

Process a chat message and return the best matching response.

**Request:**

```json
{
  "message": "What is TRESA?"
}
```

**Response:**

```json
{
  "response": "TRESA stands for Trust in Real Estate Services Act...",
  "source": "FAQ Database",
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

## Installation

1. Install dependencies at the backend folder:

```powershell
cd dev\backend
npm install
```

2. Ensure the `data/` directory contains the JSON knowledge files:

- `faq.json`
- `legal.json`
- `misc.json`

3. Place optional PDF documents in the repository `documents/` folder (top-level `documents/`). The backend will read those files when building the PDF search index.

## Configuration (environment)

The backend supports a few environment variables (set these in a `.env` file or in your environment):

- `PORT` — port to bind the server (default: `3000`).
- `NODE_ENV` — `development` or `production`.
- `LOG_LEVEL` — optional log level (`info`, `debug`, `warn`, `error`).

Example `.env`:

```
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Usage

### Development

Run with hot reload (nodemon):

```powershell
npm run dev
```

### Production

Start in production mode:

```powershell
npm start
```

The server will bind to the port defined in `PORT` (default 3000).

## Scripts

Common scripts in `dev/backend/package.json` (subject to change):

- `dev` — start with `nodemon` for development
- `start` — production start (node server)
- `lint` — run linters (if configured)

Run scripts from the `dev/backend` directory, or from the repo root using workspace-aware tooling.

## Logging & Debugging

- Use `LOG_LEVEL=debug` to enable more verbose logs.
- For runtime debugging, attach a Node debugger to the process (see `npm run dev:debug` if available).

## Tests

There are currently no automated tests included. Adding unit tests for `src/services` (search and data loading) is recommended as a next step.

## Links

- Back to repository README: [../README.md](../README.md)
- Frontend README: [../frontend/README.md](../frontend/README.md)

## Search Logic

The chatbot uses a prioritized search strategy:

1. **Exact matches** in miscellaneous/greeting data
2. **Exact matches** in FAQ data
3. **Keyword detection** for pricing questions
4. **Keyword detection** for legal questions
5. **Fuzzy search** in miscellaneous data
6. **Enhanced fuzzy search** in FAQ data with synonym handling
7. **Fuzzy search** in legal data
8. **PDF fallback search**
9. **Best available match** with score thresholds
10. **Final fallback** message

## Configuration

Search thresholds and behavior can be adjusted in `src/services/searchService.js`:

- FAQ fuzzy search: threshold 0.6
- Legal fuzzy search: threshold 0.4
- Misc fuzzy search: threshold 0.2
- PDF fuzzy search: threshold 0.6

## Error Handling

The API includes comprehensive error handling:

- Input validation
- Graceful degradation when data sources are unavailable
- Fallback responses for unmatched queries
- Server-level error catching and logging
