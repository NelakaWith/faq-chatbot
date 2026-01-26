const pdf = require("pdf-parse");
const { searchService } = require("./searchService");
const dataService = require("./dataService");
const axios = require("axios");

class RagService {
  constructor() {
    this.CHUNK_SIZE = 1000;
    this.CHUNK_OVERLAP = 200;
  }

  /**
   * Process an uploaded PDF file
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} filename - Original filename
   */
  async processDocument(fileBuffer, filename) {
    try {
      console.log(`📄 Processing PDF: ${filename}`);

      // 1. Extract text from PDF
      const data = await pdf(fileBuffer);
      const text = data.text;

      console.log(`✅ Text extracted from ${filename} (${text.length} chars)`);

      // 2. Chunk text
      const chunks = this.chunkText(text, this.CHUNK_SIZE, this.CHUNK_OVERLAP);
      console.log(`📦 Generated ${chunks.length} chunks`);

      // 3. Add to DataService (in-memory storage for this demo)
      // In a production app, we would compute embeddings here and store in a vector DB
      const processedChunks = chunks.map((chunk, index) => ({
        id: `${filename}-${index}`,
        type: "pdf_chunk",
        title: filename,
        content: chunk,
        source: filename,
        page: 1, // pdf-parse doesn't give page-by-page easily without finer control, assuming 1 for now or we could improve
        chunkIndex: index + 1,
        totalChunks: chunks.length,
        extractedAt: new Date().toISOString()
      }));

      // Store chunks
      dataService.addPdfChunks(processedChunks, {
        filename,
        title: filename,
        pages: data.numpages,
        extractedAt: new Date().toISOString()
      });

      // Re-initialize search service to include new data
      // Note: In a real vector DB setup, we wouldn't need to reload everything
      await searchService.initialize();

      return {
        success: true,
        chunks: processedChunks,
        info: data.info
      };

    } catch (error) {
      console.error("❌ PDF extraction error:", error);
      throw new Error("Failed to process PDF document");
    }
  }

  /**
   * Split text into overlapping chunks
   * @param {string} text
   * @param {number} size
   * @param {number} overlap
   */
  chunkText(text, size, overlap) {
    const chunks = [];
    let start = 0;

    // Clean text a bit
    const cleanText = text.replace(/\s+/g, " ").trim();

    while (start < cleanText.length) {
      const end = Math.min(start + size, cleanText.length);
      chunks.push(cleanText.slice(start, end));
      start += size - overlap;
    }

    return chunks;
  }
}

const ragService = new RagService();

module.exports = {
  ragService
};
