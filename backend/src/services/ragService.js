const pdf = require("pdf-parse");
const { searchService } = require("./searchService");
const dataService = require("./dataService");
const { pool } = require("../db");
const { generateEmbedding } = require("../utils/embeddings");

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

      // 1. Extract text from PDF with page tracking
      const { text, pageMap, totalPages } =
        await this.extractTextWithPages(fileBuffer);

      console.log(
        `✅ Text extracted from ${filename} (${text.length} chars, ${totalPages} pages)`,
      );

      // 2. Chunk text
      const chunks = this.chunkText(text, this.CHUNK_SIZE, this.CHUNK_OVERLAP);
      console.log(`📦 Generated ${chunks.length} chunks`);

      // 3. Process each chunk and save to Neon DB
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const pages = this.getChunkPages(chunk, text, pageMap);
          
          // Generate embedding for the chunk
          const embedding = await generateEmbedding(chunk);

          const metadata = {
            filename,
            page: pages.start,
            pageEnd: pages.end,
            chunkIndex: i + 1,
            totalChunks: chunks.length,
            extractedAt: new Date().toISOString()
          };

          // Store in Neon with pgvector
          await client.query(
            'INSERT INTO documents (content, embedding, metadata) VALUES ($1, $2, $3)',
            [chunk, JSON.stringify(embedding), JSON.stringify(metadata)]
          );

          if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
            console.log(`💾 Progress: ${i + 1}/${chunks.length} chunks stored`);
          }
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      // Update legacy search indices to include new data (for backward compatibility)
      searchService.updateSearchIndices();

      return {
        success: true,
        totalChunks: chunks.length,
        totalPages,
      };
    } catch (error) {
      console.error("❌ PDF extraction error:", error);
      throw new Error("Failed to process PDF document: " + error.message);
    }
  }

  /**
   * Extract text from PDF with page boundary tracking
   * @param {Buffer} fileBuffer - The PDF file buffer
   * @returns {Promise<{text: string, pageMap: Array, totalPages: number}>}
   */
  async extractTextWithPages(fileBuffer) {
    const pageTexts = [];
    const pageMap = []; // Array of {page: number, startIndex: number, endIndex: number}

    // Custom render page function to track text by page
    const options = {
      pagerender: async (pageData) => {
        const renderOptions = {
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        };

        return pageData.getTextContent(renderOptions).then((textContent) => {
          const pageText = textContent.items.map((item) => item.str).join(" ");
          return pageText;
        });
      },
    };

    const data = await pdf(fileBuffer, options);

    // Build the full text and page map
    let currentIndex = 0;
    const fullTextParts = [];

    // Process each page
    for (let pageNum = 1; pageNum <= data.numpages; pageNum++) {
      // Extract text for this page
      const pageBuffer = fileBuffer;
      const pageOptions = {
        ...options,
        max: pageNum,
        // Get only this specific page
        pagerender: async (pageData) => {
          if (pageData.pageIndex + 1 !== pageNum) return "";

          const renderOptions = {
            normalizeWhitespace: false,
            disableCombineTextItems: false,
          };

          return pageData.getTextContent(renderOptions).then((textContent) => {
            return textContent.items.map((item) => item.str).join(" ");
          });
        },
      };

      // For simplicity, we'll use the full text and estimate page boundaries
      // This is a reasonable approximation for most PDFs
      const pageText = data.text
        .split("\n")
        .slice(
          Math.floor(
            ((pageNum - 1) * data.text.split("\n").length) / data.numpages,
          ),
          Math.floor((pageNum * data.text.split("\n").length) / data.numpages),
        )
        .join("\n");

      const startIndex = currentIndex;
      const endIndex = currentIndex + pageText.length;

      pageMap.push({
        page: pageNum,
        startIndex,
        endIndex,
      });

      fullTextParts.push(pageText);
      currentIndex = endIndex;
    }

    const text = data.text; // Use the original extracted text for consistency

    // Create a more accurate page map based on actual text
    const accuratePageMap = [];
    const avgPageLength = Math.floor(text.length / data.numpages);

    for (let i = 0; i < data.numpages; i++) {
      accuratePageMap.push({
        page: i + 1,
        startIndex: i * avgPageLength,
        endIndex: (i + 1) * avgPageLength,
      });
    }

    // Adjust the last page to include any remaining text
    if (accuratePageMap.length > 0) {
      accuratePageMap[accuratePageMap.length - 1].endIndex = text.length;
    }

    return {
      text,
      pageMap: accuratePageMap,
      totalPages: data.numpages,
    };
  }

  /**
   * Determine which pages a chunk spans based on its position in the full text
   * @param {string} chunk - The text chunk
   * @param {string} fullText - The full document text
   * @param {Array} pageMap - Page boundary map
   * @returns {{start: number, end: number}}
   */
  getChunkPages(chunk, fullText, pageMap) {
    // Find where this chunk appears in the full text
    const chunkStart = fullText.indexOf(chunk);
    if (chunkStart === -1) {
      return { start: 1, end: 1 }; // Fallback if chunk not found
    }

    const chunkEnd = chunkStart + chunk.length;

    // Find which pages this chunk spans
    let startPage = 1;
    let endPage = 1;

    for (const page of pageMap) {
      if (chunkStart >= page.startIndex && chunkStart < page.endIndex) {
        startPage = page.page;
      }
      if (chunkEnd > page.startIndex && chunkEnd <= page.endIndex) {
        endPage = page.page;
        break;
      }
      if (chunkEnd > page.endIndex) {
        endPage = page.page;
      }
    }

    return { start: startPage, end: endPage };
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
