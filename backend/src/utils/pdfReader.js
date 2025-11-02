const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");

class PDFReader {
  /**
   * Extract text from a single PDF file
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);

      return {
        filename: path.basename(filePath),
        title: path.basename(filePath, ".pdf"),
        text: data.text,
        pages: data.numpages,
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `❌ Error extracting text from ${filePath}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Load all PDFs from a directory
   */
  async loadPDFsFromDirectory(directoryPath) {
    try {
      const files = fs.readdirSync(directoryPath);
      const pdfFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".pdf"
      );

      console.log(`📚 Found ${pdfFiles.length} PDF files in ${directoryPath}`);

      const pdfDocuments = [];

      for (const pdfFile of pdfFiles) {
        const filePath = path.join(directoryPath, pdfFile);
        console.log(`📄 Processing ${pdfFile}...`);

        try {
          const pdfData = await this.extractTextFromPDF(filePath);
          pdfDocuments.push(pdfData);
          console.log(
            `✅ Successfully processed ${pdfFile} (${pdfData.pages} pages)`
          );
        } catch (error) {
          console.error(`❌ Failed to process ${pdfFile}:`, error.message);
        }
      }

      return pdfDocuments;
    } catch (error) {
      console.error(
        `❌ Error reading directory ${directoryPath}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Split PDF content into searchable chunks
   */
  chunkPDFContent(pdfDocument, wordsPerChunk = 300) {
    const words = pdfDocument.text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const chunkText = chunkWords.join(" ");

      chunks.push({
        type: "pdf_chunk",
        title: `${pdfDocument.title} - Part ${
          Math.floor(i / wordsPerChunk) + 1
        }`,
        content: chunkText,
        source: pdfDocument.filename,
        chunkIndex: Math.floor(i / wordsPerChunk) + 1,
        totalChunks: Math.ceil(words.length / wordsPerChunk),
      });
    }

    return chunks;
  }
}

module.exports = PDFReader;
