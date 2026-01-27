const { ragService } = require("../services/ragService");

const uploadDocument = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Please select a PDF file to upload",
      });
    }

    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;
    const fileSize = req.file.size;

    // Validate file is not empty
    if (fileSize === 0) {
      return res.status(400).json({
        error: "Empty file",
        message: "The uploaded file is empty. Please select a valid PDF file.",
      });
    }

    // Validate minimum file size (1KB)
    const MIN_FILE_SIZE = 1024; // 1KB
    if (fileSize < MIN_FILE_SIZE) {
      return res.status(400).json({
        error: "File too small",
        message:
          "The uploaded file is too small to contain meaningful content. Minimum size is 1KB.",
      });
    }

    // Validate maximum file size (should be caught by multer, but double-check)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (fileSize > MAX_FILE_SIZE) {
      return res.status(413).json({
        error: "File too large",
        message: "The uploaded file exceeds the maximum size of 5MB.",
      });
    }

    // Validate buffer content exists
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        error: "Invalid file content",
        message: "Unable to read file content. Please try again.",
      });
    }

    console.log(
      `📥 Received file upload: ${filename} (${(fileSize / 1024).toFixed(2)} KB)`,
    );

    const result = await ragService.processDocument(fileBuffer, filename);

    // Validate that chunks were generated
    if (!result.chunks || result.chunks.length === 0) {
      return res.status(422).json({
        error: "No content extracted",
        message:
          "Unable to extract text content from the PDF. The file may be image-based or corrupted.",
      });
    }

    res.json({
      message: "Document uploaded and processed successfully",
      filename: filename,
      chunks: result.chunks,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);

    // Handle specific error types
    if (
      error.message &&
      error.message.includes("Maximum upload capacity reached")
    ) {
      return res.status(507).json({
        error: "Storage capacity exceeded",
        message: error.message,
      });
    }

    if (error.message && error.message.includes("Failed to process PDF")) {
      return res.status(422).json({
        error: "PDF processing failed",
        message:
          "Unable to extract text from the PDF. The file may be corrupted, password-protected, or image-based.",
      });
    }

    // Generic error response
    res.status(500).json({
      error: "Failed to process document",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred while processing your document. Please try again.",
    });
  }
};

module.exports = {
  uploadDocument,
};
