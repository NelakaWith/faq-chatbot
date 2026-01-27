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
        extractedAt: new Date().toISOString(),
      }));

      // Store chunks
      dataService.addPdfChunks(processedChunks, {
        filename,
        title: filename,
        pages: data.numpages,
        extractedAt: new Date().toISOString(),
      });

      // Re-initialize search service to include new data
      // Note: In a real vector DB setup, we wouldn't need to reload everything
      await searchService.initialize();

      return {
        success: true,
        chunks: processedChunks,
        info: data.info,
      };
    } catch (error) {
      console.error("❌ PDF extraction error:", error);
      throw new Error("Failed to process PDF document");
    }
  }

  /**
   * Split text into overlapping chunks with semantic awareness
   * @param {string} text
   * @param {number} size
   * @param {number} overlap
   */
  chunkText(text, size, overlap) {
    const chunks = [];
    let start = 0;

    // Normalize whitespace while preserving paragraph breaks
    const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    while (start < cleanText.length) {
      let end = Math.min(start + size, cleanText.length);

      // If not at the end of text, find a good breaking point
      if (end < cleanText.length) {
        end = this.findSemanticBoundary(cleanText, start, end, size);
      }

      const chunk = cleanText.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Move start forward, accounting for overlap
      start = end - overlap;

      // Ensure we make progress even with overlap
      if (
        start <= chunks.length > 0
          ? cleanText.indexOf(chunks[chunks.length - 1])
          : 0
      ) {
        start = end;
      }
    }

    return chunks;
  }

  /**
   * Find a semantic boundary (paragraph, sentence, or word) near the target position
   * @param {string} text
   * @param {number} start - Start position of chunk
   * @param {number} end - Target end position
   * @param {number} maxSize - Maximum chunk size
   * @returns {number} - Adjusted end position
   */
  findSemanticBoundary(text, start, end, maxSize) {
    const searchStart = Math.max(start, end - 100); // Look back up to 100 chars
    const searchText = text.slice(searchStart, end + 100); // Look ahead up to 100 chars
    const offset = searchStart;

    // 1. Try to break at paragraph (double newline or single newline followed by indent/capital)
    const paragraphPattern = /\n\n+|\n(?=[A-Z]|\s{2,})/g;
    let match;
    let bestParagraphBreak = -1;

    paragraphPattern.lastIndex = 0;
    while ((match = paragraphPattern.exec(searchText)) !== null) {
      const breakPos = offset + match.index + match[0].length;
      if (breakPos <= end && breakPos >= end - 200) {
        bestParagraphBreak = breakPos;
      } else if (breakPos > end) {
        if (bestParagraphBreak === -1 && breakPos <= start + maxSize) {
          bestParagraphBreak = breakPos;
        }
        break;
      }
    }

    if (bestParagraphBreak !== -1) {
      return bestParagraphBreak;
    }

    // 2. Try to break at sentence end (. ! ? followed by space or newline)
    const sentencePattern = /[.!?][\s\n]+/g;
    let bestSentenceBreak = -1;

    sentencePattern.lastIndex = 0;
    while ((match = sentencePattern.exec(searchText)) !== null) {
      const breakPos = offset + match.index + match[0].length;
      if (breakPos <= end && breakPos >= end - 100) {
        bestSentenceBreak = breakPos;
      } else if (breakPos > end) {
        if (bestSentenceBreak === -1 && breakPos <= start + maxSize) {
          bestSentenceBreak = breakPos;
        }
        break;
      }
    }

    if (bestSentenceBreak !== -1) {
      return bestSentenceBreak;
    }

    // 3. Try to break at word boundary (space, newline, or punctuation)
    const wordPattern = /[\s\n,;:]+/g;
    let bestWordBreak = -1;

    wordPattern.lastIndex = 0;
    while ((match = wordPattern.exec(searchText)) !== null) {
      const breakPos = offset + match.index + match[0].length;
      if (breakPos <= end && breakPos >= end - 50) {
        bestWordBreak = breakPos;
      } else if (breakPos > end) {
        if (bestWordBreak === -1 && breakPos <= start + maxSize) {
          bestWordBreak = breakPos;
        }
        break;
      }
    }

    if (bestWordBreak !== -1) {
      return bestWordBreak;
    }

    // 4. Fallback: return original end if no good boundary found
    return end;
  }
}

const ragService = new RagService();

module.exports = {
  ragService,
};
