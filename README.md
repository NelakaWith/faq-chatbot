# FAQ Chatbot with PDF Support

A sophisticated Node.js chatbot with fuzzy search capabilities, PDF document processing, and multi-source knowledge base integration.

## Project Structure

```
faq-chatbot/
├── .git/                    # Git repository
├── .gitignore              # Git ignore rules
├── documents/              # PDF documents for knowledge base
│   └── doc01.pdf          # TRESA legislation document
├── dev/
│   ├── backend/           # Node.js + Express API server
│   │   ├── .gitignore     # Backend-specific ignore rules
│   │   ├── data/          # JSON knowledge base files
│   │   │   ├── faq.json   # Frequently asked questions
│   │   │   ├── legal.json # Legal information
│   │   │   └── misc.json  # Greetings and miscellaneous
│   │   ├── src/           # Source code (restructured)
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

## Knowledge Base

The chatbot has access to multiple data sources:

### FAQ Database (10 items)

- TRESA legislation questions
- Effective dates and implementation
- Professional requirements
- Consumer protection information

### Legal Database (10 items)

- Terms and conditions
- Compliance requirements
- Dispute resolution
- Regulatory information

### Miscellaneous Database (12 items)

- Greetings and small talk
- General assistance
- Contact information
- Common conversational responses

### PDF Documents (1 document, 68 chunks)

- TRESA legislation document
- Automatically processed and chunked for search
- Source attribution with page references

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

## Testing

Try asking questions like:

### TRESA-Specific Questions:

- "TRESA effective date"
- "When did TRESA come into effect?"
- "What is TRESA?"
- "Who does TRESA apply to?"

### Legal Questions:

- "What are the penalties for TRESA violations?"
- "What disclosures are required?"
- "How are complaints handled?"

### General Questions:

- "Hi" or "Hello"
- "Help"
- "What can you tell me?"

## Architecture

The backend follows Express.js best practices with:

- **Separation of Concerns**: Controllers, services, routes, and utilities
- **Modular Design**: Clean dependency injection and service layers
- **Error Handling**: Comprehensive error handling and validation
- **Graceful Shutdown**: Proper process management
- **Configuration**: Environment-based configuration
- **Logging**: Structured logging throughout

## Dependencies

### Runtime Dependencies:

- `express` - Web framework
- `fuse.js` - Fuzzy search library
- `cors` - Cross-origin resource sharing
- `pdf-parse` - PDF text extraction

### Development Dependencies:

- `nodemon` - Development auto-restart

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
