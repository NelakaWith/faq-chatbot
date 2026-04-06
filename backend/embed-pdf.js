const fs = require('fs');
const path = require('path');
const { ragService } = require('./src/services/ragService');
const { pool, initializeSchema, initVector } = require('./src/db');
require('dotenv').config();

async function embedPdf() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Error: Please provide a path to a PDF file.');
    console.log('Usage: node embed-pdf.js <path-to-pdf>');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found at ${filePath}`);
    process.exit(1);
  }

  if (path.extname(filePath).toLowerCase() !== '.pdf') {
    console.error('❌ Error: Only PDF files are supported.');
    process.exit(1);
  }

  try {
    console.log(`🚀 Starting embedding process for: ${path.basename(filePath)}`);
    
    // Ensure database is ready
    await initializeSchema();
    await initVector();

    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);

    const result = await ragService.processDocument(fileBuffer, filename);

    if (result.success) {
      console.log('✅ PDF successfully embedded in Neon!');
      console.log(`📊 Stats: ${result.totalChunks} chunks stored across ${result.totalPages} pages.`);
    } else {
      console.error('❌ Failed to embed PDF.');
    }
  } catch (err) {
    console.error('❌ Critical error during processing:', err.message);
  } finally {
    // Close the database pool to allow the script to exit
    await pool.end();
  }
}

embedPdf();
