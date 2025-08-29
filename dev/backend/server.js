const app = require("./src/app");
const { initializeSearchService } = require("./src/services/searchService");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("🚀 Starting FAQ Chatbot Server...");

    // Initialize search service (loads data and creates search indexes)
    await initializeSearchService();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`💬 Chat API: http://localhost:${PORT}/chat`);
      console.log(`📊 Status API: http://localhost:${PORT}/status`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`🛑 Received ${signal}, shutting down gracefully`);
      server.close(() => {
        console.log("✅ Server closed successfully");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
