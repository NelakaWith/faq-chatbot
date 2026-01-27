const fs = require("fs");
const path = require("path");
const PDFReader = require("../utils/pdfReader");

class DataService {
  constructor() {
    this.faqData = [];
    this.legalData = [];
    this.miscData = [];
    this.pdfDocuments = [];
    this.allSearchableData = [];
    this.pdfReader = new PDFReader();

    // Memory management configuration
    this.MAX_UPLOADED_CHUNKS = 1000; // Maximum chunks from uploaded PDFs
    this.MAX_UPLOAD_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
    this.uploadedChunksCount = 0;
  }

  async loadAllData() {
    console.log("📚 Loading all data sources...");

    // Load JSON data files
    this.loadJSONData();

    // Load PDF documents
    await this.loadPDFDocuments();

    // Combine all searchable data
    this.createSearchableData();

    console.log("✅ All data loaded successfully");
  }

  loadJSONData() {
    const dataPath = path.join(__dirname, "..", "..", "data");

    // Load FAQ data
    try {
      this.faqData = JSON.parse(
        fs.readFileSync(path.join(dataPath, "faq.json"), "utf8"),
      );
      console.log("📚 Loaded FAQ data:", this.faqData.length, "items");
    } catch (e) {
      console.log("⚠️ No faq.json found or failed to load");
      this.faqData = [];
    }

    // Load legal data
    try {
      this.legalData = JSON.parse(
        fs.readFileSync(path.join(dataPath, "legal.json"), "utf8"),
      );
      console.log("📚 Loaded legal data:", this.legalData.length, "items");
    } catch (e) {
      console.log("⚠️ No legal.json found or failed to load");
      this.legalData = [];
    }

    // Load misc data
    try {
      this.miscData = JSON.parse(
        fs.readFileSync(path.join(dataPath, "misc.json"), "utf8"),
      );
      console.log("📚 Loaded misc data:", this.miscData.length, "items");
    } catch (e) {
      console.log("⚠️ No misc.json found or failed to load");
      this.miscData = [];
    }
  }

  async loadPDFDocuments() {
    const documentsPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "documents",
    );

    if (!fs.existsSync(documentsPath)) {
      console.log("📁 Documents folder not found, using JSON data only");
      console.log("📁 Checked path:", documentsPath);
      return;
    }

    console.log("📄 Loading PDF documents...");
    try {
      this.pdfDocuments =
        await this.pdfReader.loadPDFsFromDirectory(documentsPath);
      console.log(
        "📚 Loaded PDF documents:",
        this.pdfDocuments.length,
        "files",
      );
    } catch (error) {
      console.error("❌ Error loading PDFs:", error.message);
      this.pdfDocuments = [];
    }
  }

  createSearchableData() {
    // Create PDF chunks
    const pdfChunks = [];
    this.pdfDocuments.forEach((pdf) => {
      const chunks = this.pdfReader.chunkPDFContent(pdf, 300);
      pdfChunks.push(...chunks);
    });

    // Combine all data
    this.allSearchableData = [
      ...this.faqData.map((item) => ({ ...item, type: "faq" })),
      ...this.miscData.map((item) => ({ ...item, type: "misc" })),
      ...this.legalData.map((item) => ({ ...item, type: "legal" })),
      ...pdfChunks,
    ];

    console.log("🔍 Total searchable items:", this.allSearchableData.length);
    console.log("📄 PDF chunks created:", pdfChunks.length);
  }

  /**
   * Add dynamic PDF chunks (from file uploads)
   * @param {Array} chunks - Processed text chunks
   * @param {Object} metadata - File metadata
   */
  addPdfChunks(chunks, metadata) {
    if (!chunks || !Array.isArray(chunks)) return;

    // Check if adding these chunks would exceed the limit
    const currentUploadedChunks = this.allSearchableData.filter(
      (item) => item.type === "pdf_chunk" && item.extractedAt,
    ).length;

    if (currentUploadedChunks + chunks.length > this.MAX_UPLOADED_CHUNKS) {
      console.warn(
        `⚠️ Upload would exceed maximum chunk limit (${this.MAX_UPLOADED_CHUNKS})`,
      );
      console.log("🧹 Cleaning up old uploaded documents...");
      this.cleanupOldUploads();

      // Check again after cleanup
      const afterCleanup = this.allSearchableData.filter(
        (item) => item.type === "pdf_chunk" && item.extractedAt,
      ).length;

      if (afterCleanup + chunks.length > this.MAX_UPLOADED_CHUNKS) {
        throw new Error(
          `Maximum upload capacity reached. Please try again later or contact support.`,
        );
      }
    }

    // Remove old chunks from the same file to prevent duplicates
    // Match by both type and source/title to ensure we only remove chunks from this specific file
    const filename = metadata.filename || metadata.title;

    this.allSearchableData = this.allSearchableData.filter((item) => {
      // Keep all non-PDF chunks
      if (item.type !== "pdf_chunk") return true;

      // Remove PDF chunks that match the current file
      // Check both 'source' and 'title' fields as different chunk sources may use different properties
      const itemSource = item.source || item.title;
      return itemSource !== filename && itemSource !== metadata.title;
    });

    // Add new chunks
    this.allSearchableData.push(...chunks);

    // Update pdfDocuments metadata list
    const existingDocIndex = this.pdfDocuments.findIndex(
      (d) => (d.filename || d.title) === filename || d.title === metadata.title,
    );

    if (existingDocIndex >= 0) {
      this.pdfDocuments[existingDocIndex] = metadata;
    } else {
      this.pdfDocuments.push(metadata);
    }

    // Update counter
    this.uploadedChunksCount = this.allSearchableData.filter(
      (item) => item.type === "pdf_chunk" && item.extractedAt,
    ).length;

    console.log(
      `✅ Added ${chunks.length} chunks for ${filename || metadata.title}`,
    );
    console.log(
      `📊 Total uploaded chunks: ${this.uploadedChunksCount}/${this.MAX_UPLOADED_CHUNKS}`,
    );
  }

  /**
   * Clean up old uploaded documents based on age
   * Removes documents older than MAX_UPLOAD_AGE_MS
   */
  cleanupOldUploads() {
    const now = Date.now();
    const initialCount = this.allSearchableData.length;

    // Filter out old uploaded PDF chunks
    this.allSearchableData = this.allSearchableData.filter((item) => {
      if (item.type !== "pdf_chunk" || !item.extractedAt) {
        return true; // Keep non-uploaded items
      }

      const age = now - new Date(item.extractedAt).getTime();
      return age < this.MAX_UPLOAD_AGE_MS;
    });

    // Update pdfDocuments metadata to remove old entries
    this.pdfDocuments = this.pdfDocuments.filter((doc) => {
      if (!doc.extractedAt) return true;
      const age = now - new Date(doc.extractedAt).getTime();
      return age < this.MAX_UPLOAD_AGE_MS;
    });

    const removed = initialCount - this.allSearchableData.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old chunks (older than 24 hours)`);
    }

    // Update counter
    this.uploadedChunksCount = this.allSearchableData.filter(
      (item) => item.type === "pdf_chunk" && item.extractedAt,
    ).length;
  }

  /**
   * Get memory usage statistics
   * @returns {Object} Statistics about current memory usage
   */
  getMemoryStats() {
    const uploadedChunks = this.allSearchableData.filter(
      (item) => item.type === "pdf_chunk" && item.extractedAt,
    );

    const totalSize = uploadedChunks.reduce((sum, chunk) => {
      return sum + (chunk.content?.length || 0);
    }, 0);

    return {
      totalItems: this.allSearchableData.length,
      uploadedChunks: uploadedChunks.length,
      maxChunks: this.MAX_UPLOADED_CHUNKS,
      usagePercent: Math.round(
        (uploadedChunks.length / this.MAX_UPLOADED_CHUNKS) * 100,
      ),
      estimatedSizeKB: Math.round(totalSize / 1024),
      uploadedDocuments: this.pdfDocuments.filter((doc) => doc.extractedAt)
        .length,
    };
  }

  getData() {
    return {
      faqData: this.faqData,
      legalData: this.legalData,
      miscData: this.miscData,
      pdfDocuments: this.pdfDocuments,
      allSearchableData: this.allSearchableData,
    };
  }
}

const dataService = new DataService();

module.exports = dataService;
