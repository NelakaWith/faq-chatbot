const { ragService } = require("../services/ragService");

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;

    console.log(`📥 Received file upload: ${filename}`);

    const result = await ragService.processDocument(fileBuffer, filename);

    res.json({
      message: "Document uploaded and processed successfully",
      filename: filename,
      chunks: result.chunks,
      info: result.info
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      error: "Failed to process document",
      details: error.message
    });
  }
};

module.exports = {
  uploadDocument
};
