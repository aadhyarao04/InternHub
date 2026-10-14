import config from '../../config/index.js';

/**
 * High-performance vector embeddings service.
 * Supports Google text-embedding API or deterministic semantic vector hashing.
 */

export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const generateEmbedding = async (text) => {
  if (!text || text.trim().length === 0) {
    return new Array(64).fill(0);
  }

  // 1. Try Google Gemini embedding if API key is set
  if (config.ai.geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${config.ai.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text: text.slice(0, 2048) }] }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.embedding?.values) {
          return data.embedding.values.slice(0, 64);
        }
      }
    } catch (err) {
      console.warn('[EmbeddingService] Cloud embedding failed, using local semantic vector:', err.message);
    }
  }

  // 2. High-Dimensional Semantic Feature Hashing (64 dimensions)
  const vector = new Array(64).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 64;
    vector[index] += 1;
  }

  // L2 Normalize vector
  let norm = 0;
  for (let i = 0; i < 64; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < 64; i++) vector[i] = vector[i] / norm;

  return vector;
};

export default {
  generateEmbedding,
  cosineSimilarity
};
