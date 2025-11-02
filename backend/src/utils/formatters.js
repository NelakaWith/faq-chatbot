/**
 * Format PDF content for better readability
 */
function formatPDFResponse(pdfContent, maxLength = 300) {
  // Clean up the text - remove common PDF artifacts
  let cleaned = pdfContent
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}/g, "") // Remove date/time stamps
    .replace(/https?:\/\/[^\s]+/g, "") // Remove URLs
    .replace(/\|[^\|]*\|/g, "") // Remove pipe-separated content
    .replace(/\([^\)]*\)/g, "") // Remove parenthetical content that might be artifacts
    .replace(/[^\w\s.,!?-]/g, "") // Remove special characters except common punctuation
    .trim();

  // If cleaning removed too much, fall back to basic cleaning
  if (cleaned.length < 50) {
    cleaned = pdfContent.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
  }

  // Try to find a good stopping point (end of sentence)
  const sentences = cleaned.split(/[.!?]+/);
  let result = "";

  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (sentence && sentence.length > 10) {
      // Skip very short fragments
      if (result.length + sentence.length + 1 <= maxLength) {
        result += (result ? ". " : "") + sentence;
      } else {
        break;
      }
    }
  }

  // If we didn't get enough content from sentences, use word-based truncation
  if (result.length < 100) {
    const words = cleaned.split(" ");
    result = words.slice(0, Math.min(50, words.length)).join(" ");
  }

  // Add ellipsis if truncated
  if (result.length < cleaned.length) {
    result += "...";
  }

  return result || cleaned.substring(0, maxLength) + "...";
}

/**
 * Format search results for consistent response structure
 */
function formatSearchResult(result, source, sourceType) {
  return {
    response: result,
    source,
    sourceType,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate message input
 */
function validateMessage(message) {
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Message must be a string" };
  }

  if (message.trim().length === 0) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > 1000) {
    return { valid: false, error: "Message is too long (max 1000 characters)" };
  }

  return { valid: true };
}

module.exports = {
  formatPDFResponse,
  formatSearchResult,
  validateMessage,
};
