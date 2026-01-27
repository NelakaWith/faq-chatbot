const express = require("express");
const multer = require("multer");
const { uploadDocument } = require("../controllers/ragController");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      // Create a MulterError-like object that will be properly handled
      const error = new Error("Only PDF files are allowed");
      error.code = "INVALID_FILE_TYPE";
      cb(error, false);
    }
  },
});

// Upload endpoint
router.post("/upload", upload.single("file"), uploadDocument);

// Multer error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle multer-specific errors
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(413).json({
          error: "File too large",
          message: "File size exceeds 5MB limit",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          error: "Too many files",
          message: "Only one file can be uploaded at a time",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          error: "Unexpected field",
          message: "Unexpected file field in request",
        });
      default:
        return res.status(400).json({
          error: "Upload error",
          message: err.message || "File upload failed",
        });
    }
  } else if (err && err.code === "INVALID_FILE_TYPE") {
    // Handle file type validation error from fileFilter
    return res.status(415).json({
      error: "Unsupported file type",
      message: err.message || "Only PDF files are allowed",
    });
  } else if (
    err &&
    err.message &&
    err.message.includes("Only PDF files are allowed")
  ) {
    // Fallback for file type errors
    return res.status(415).json({
      error: "Unsupported file type",
      message: "Only PDF files are allowed",
    });
  }

  // Pass other errors to the global error handler
  next(err);
});

module.exports = router;
