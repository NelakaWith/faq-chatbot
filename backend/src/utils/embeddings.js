const { pipeline } = require('@xenova/transformers');

let embeddingPipeline = null;

/**
 * Get or initialize the embedding pipeline
 * Using all-MiniLM-L6-v2 for lightweight 1GB Droplet support
 */
async function getPipeline() {
  if (!embeddingPipeline) {
    console.log('🤖 Loading embedding model (all-MiniLM-L6-v2)...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded');
  }
  return embeddingPipeline;
}

/**
 * Explicitly preload the embedding pipeline at startup
 */
async function preloadEmbeddingPipeline() {
  return await getPipeline();
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
  generateEmbedding,
  preloadEmbeddingPipeline
};
