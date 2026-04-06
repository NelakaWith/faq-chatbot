/**
 * Mapping of technical filenames to proper legal titles
 * This serves as a single point of truth for document naming in the RAG system.
 */
const legalNames = {
  "CIVIL_PROCEDURE_CODE.pdf": "Civil Procedure Code",
  "PENAL_CODE.pdf": "Penal Code",
  "EVIDENCE_ACT.pdf": "Evidence Act",
  "CONSTITUTION.pdf": "Constitution of Sri Lanka",
  // Add new mappings here as you upload more documents
};

/**
 * Format a filename to a proper title using the mapping above or a fallback
 * @param {string} filename - The raw filename from the database
 * @returns {string} The professional title
 */
const formatLegalTitle = (filename) => {
  if (!filename) return "Unknown Document";
  
  // 1. Check direct mapping
  if (legalNames[filename]) return legalNames[filename];
  
  // 2. Case-insensitive check
  const entry = Object.entries(legalNames).find(([key]) => key.toLowerCase() === filename.toLowerCase());
  if (entry) return entry[1];
  
  // 3. Fallback: Clean up the filename
  return filename
    .replace(/_/g, " ")
    .replace(".pdf", "")
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Simple Title Case
};

module.exports = {
  legalNames,
  formatLegalTitle
};
