require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { ragService } = require("../src/services/ragService");
const { pool } = require("../src/db");

async function reEmbed(filename) {
  try {
    console.log(`🧹 Cleaning up existing data for: ${filename}`);
    const client = await pool.connect();
    try {
      await client.query(
        "DELETE FROM documents WHERE metadata->>'filename' = $1",
        [filename],
      );
      console.log(`✅ Old data removed.`);
    } finally {
      client.release();
    }

    const filePath = path.join(__dirname, "data", filename);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log(`🚀 Starting re-ingestion for ${filename}...`);
    const result = await ragService.processDocument(fileBuffer, filename);

    console.log(`\n✨ Re-ingestion Complete!`);
    console.log(
      `- Total Chunks: ${result.processedChunks}/${result.totalChunks}`,
    );
    console.log(`- Total Pages: ${result.totalPages}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Re-ingestion failed:", error);
    process.exit(1);
  }
}

const targetFile = process.argv[2] || "CIVIL_PROCEDURE_CODE.pdf";
reEmbed(targetFile);
