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

      // 1. Extract text from PDF with page tracking and structural detection
      const { text, pageMap, totalPages, structures } =
        await this.extractTextWithPages(fileBuffer);

      console.log(
        `✅ Text extracted from ${filename} (${text.length} chars, ${totalPages} pages)`,
      );

      // 2. Chunk text
      const chunks = this.chunkText(text, this.CHUNK_SIZE, this.CHUNK_OVERLAP);
      console.log(`📦 Generated ${chunks.length} chunks`);

      // 3. Process chunks in batches to avoid database timeouts
      const BATCH_SIZE = 20;
      let totalProcessed = 0;

      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const processedBatch = [];

        // Generate embeddings for the batch OUTSIDE the transaction
        for (let j = 0; j < batch.length; j++) {
          const chunk = batch[j];
          const chunkIndex = i + j;
          const charIndex = text.indexOf(chunk);
          const pages = this.getChunkPages(chunk, text, pageMap);
          const structure = this.getChunkStructure(charIndex, structures);
          
          try {
            const embedding = await generateEmbedding(chunk);
            processedBatch.push({
              content: chunk,
              embedding,
              metadata: {
                filename,
                page: pages.start,
                part: structure.part,
                chapter: structure.chapter,
                chunkIndex: chunkIndex + 1,
                totalChunks: chunks.length,
                extractedAt: new Date().toISOString()
              }
            });
          } catch (embedError) {
            console.error(`⚠️ Failed to generate embedding for chunk ${chunkIndex + 1}:`, embedError);
            // Continue with other chunks
          }
        }

        // Save batch to database in a short-lived transaction
        if (processedBatch.length > 0) {
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            for (const item of processedBatch) {
              await client.query(
                'INSERT INTO documents (content, embedding, metadata) VALUES ($1, $2, $3)',
                [item.content, JSON.stringify(item.embedding), JSON.stringify(item.metadata)]
              );
            }
            await client.query('COMMIT');
            totalProcessed += processedBatch.length;
            console.log(`💾 Progress: ${totalProcessed}/${chunks.length} chunks stored`);
          } catch (dbErr) {
            await client.query('ROLLBACK');
            console.error(`❌ Batch database error (batch starting at ${i}):`, dbErr);
          } finally {
            client.release();
          }
        }
      }

      // Update legacy search indices to include new data (for backward compatibility)
      searchService.updateSearchIndices();

      return {
        success: totalProcessed > 0,
        totalChunks: chunks.length,
        processedChunks: totalProcessed,
        totalPages,
      };
    } catch (error) {
      console.error("❌ PDF extraction error:", error);
      throw new Error("Failed to process PDF document: " + error.message);
    }
  }

  /**
   * Extract text from PDF with page boundary and structural tracking
   * @param {Buffer} fileBuffer - The PDF file buffer
   * @returns {Promise<{text: string, pageMap: Array, totalPages: number, structures: Array}>}
   */
  async extractTextWithPages(fileBuffer) {
    const data = await pdf(fileBuffer);
    const text = data.text;
    const totalPages = data.numpages;

    // Build the structural map (Parts, Chapters)
    const structures = [];
    const lines = text.split('\n');
    let currentPart = null;
    let currentChapter = null;
    let totalChars = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineLength = lines[i].length + 1; // +1 for the newline

        // Detect Part
        const partMatch = line.match(/^PART\s+([IVXLCDM]+|[\d]+)/i);
        if (partMatch) {
            currentPart = line;
            // The next line might be the title
            const nextLine = lines[i+1]?.trim();
            if (nextLine && !nextLine.match(/^CHAPTER/i) && nextLine.length > 3) {
                currentPart += `: ${nextLine}`;
            }
            structures.push({ type: 'PART', name: currentPart, index: totalChars });
        }

        // Detect Chapter
        const chapterMatch = line.match(/^CHAPTER\s+([IVXLCDM]+|[\d]+)/i);
        if (chapterMatch) {
            currentChapter = line;
            // The next line might be the title
            const nextLine = lines[i+1]?.trim();
            if (nextLine && nextLine.length > 3 && !nextLine.match(/^\d+\./)) {
                currentChapter += `: ${nextLine}`;
            }
            structures.push({ type: 'CHAPTER', name: currentChapter, index: totalChars });
        }

        totalChars += lineLength;
    }

    // Create a page map (approximate)
    const avgPageLength = Math.floor(text.length / totalPages);
    const pageMap = [];
    for (let i = 0; i < totalPages; i++) {
      pageMap.push({
        page: i + 1,
        startIndex: i * avgPageLength,
        endIndex: (i + 1) * avgPageLength,
      });
    }
    if (pageMap.length > 0) pageMap[pageMap.length - 1].endIndex = text.length;

    return {
      text,
      pageMap,
      totalPages,
      structures
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
   * Determine the current Part and Chapter for a given character index
   */
  getChunkStructure(charIndex, structures) {
    let currentPart = "Unknown Part";
    let currentChapter = "Unknown Chapter";

    for (const struct of structures) {
        if (struct.index <= charIndex) {
            if (struct.type === 'PART') currentPart = struct.name;
            if (struct.type === 'CHAPTER') currentChapter = struct.name;
        } else {
            break;
        }
    }

    return { part: currentPart, chapter: currentChapter };
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

    // Normalize whitespace
    const cleanText = text.replace(/\s+/g, " ");

    while (start < cleanText.length) {
      let end = start + size;
      
      if (end < cleanText.length) {
        // Look for a reasonable boundary within the last 20% of the chunk
        const searchRange = Math.floor(size * 0.2);
        const searchText = cleanText.slice(end - searchRange, end + 50);
        
        // Try paragraph, then sentence, then space
        const pMatch = searchText.match(/\n\n/);
        const sMatch = searchText.match(/[.!?]\s/);
        const wMatch = searchText.match(/\s/);
        
        const boundary = pMatch || sMatch || wMatch;
        if (boundary) {
          end = (end - searchRange) + boundary.index + boundary[0].length;
        }
      }

      const chunk = cleanText.slice(start, Math.min(end, cleanText.length)).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Ensure we always move forward by at least 1 character even if overlap is large
      const nextStart = end - overlap;
      start = nextStart > start ? nextStart : end;
    }

    return chunks;
  }
}

const ragService = new RagService();

module.exports = {
  ragService,
};
