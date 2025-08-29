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
        fs.readFileSync(path.join(dataPath, "faq.json"), "utf8")
      );
      console.log("📚 Loaded FAQ data:", this.faqData.length, "items");
    } catch (e) {
      console.log("⚠️ No faq.json found or failed to load");
      this.faqData = [];
    }

    // Load legal data
    try {
      this.legalData = JSON.parse(
        fs.readFileSync(path.join(dataPath, "legal.json"), "utf8")
      );
      console.log("📚 Loaded legal data:", this.legalData.length, "items");
    } catch (e) {
      console.log("⚠️ No legal.json found or failed to load");
      this.legalData = [];
    }

    // Load misc data
    try {
      this.miscData = JSON.parse(
        fs.readFileSync(path.join(dataPath, "misc.json"), "utf8")
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
      "documents"
    );

    if (!fs.existsSync(documentsPath)) {
      console.log("📁 Documents folder not found, using JSON data only");
      console.log("📁 Checked path:", documentsPath);
      return;
    }

    console.log("📄 Loading PDF documents...");
    try {
      this.pdfDocuments = await this.pdfReader.loadPDFsFromDirectory(
        documentsPath
      );
      console.log(
        "📚 Loaded PDF documents:",
        this.pdfDocuments.length,
        "files"
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
