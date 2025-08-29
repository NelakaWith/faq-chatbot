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

1. Install dependencies:

```bash
npm install
```

2. Ensure data files exist in the `data/` directory:

   - `faq.json`
   - `legal.json`
   - `misc.json`

3. Place PDF documents in the `../../documents/` directory (optional)

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on port 3000 by default.

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
