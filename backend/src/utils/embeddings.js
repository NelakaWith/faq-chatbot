const { pipeline } = require('@xenova/transformers');

let embeddingPipeline = null;

/**
 * Get or initialize the embedding pipeline
 * Using BGE-M3 model for multilingual and long-context support
 */
async function getPipeline() {
  if (!embeddingPipeline) {
    console.log('🤖 Loading embedding model (BGE-M3)...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/bge-m3');
    console.log('✅ Embedding model loaded');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a text chunk
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
async function generateEmbedding(text) {
  try {
    const extractor = await getPipeline();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Convert Float32Array to standard array
    return Array.from(output.data);
  } catch (err) {
    console.error('❌ Error generating embedding:', err);
    throw err;
  }
}

module.exports = {
  generateEmbedding
};
