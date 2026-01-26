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
      cb(new Error("Only PDF files are allowed"), false);
    }
  }
});

// Upload endpoint
router.post("/upload", upload.single("file"), uploadDocument);

module.exports = router;
