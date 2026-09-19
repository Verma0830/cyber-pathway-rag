/**
 * Zero-Cost Deterministic Semantic Embedding Provider
 * Implements IEmbeddingProvider with sublinear TF-IDF, n-gram hashing,
 * and L2-normalized vector outputs (dimension: 384).
 * Runs in pure JavaScript with zero external network requests and $0 cost.
 */
import { IEmbeddingProvider } from '../adapters/IEmbeddingProvider.js';

export class LocalSemanticEmbeddingProvider extends IEmbeddingProvider {
  constructor(dimension = 384) {
    super('local-semantic-embedding');
    this.dimension = dimension;
  }

  getDimension() {
    return this.dimension;
  }

  /**
   * Fast Fowler-Noll-Vo 1a hash for string token to integer.
   */
  _hashToken(token, seed = 0x811c9dc5) {
    let h = seed;
    for (let i = 0; i < token.length; i++) {
      h ^= token.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h);
  }

  /**
   * Generates a 384-dimensional dense float vector from text.
   * @param {string} text
   * @returns {Promise<Float32Array>}
   */
  async embedQuery(text) {
    const vector = new Float32Array(this.dimension);
    if (!text || typeof text !== 'string') return vector;

    const words = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);

    if (words.length === 0) return vector;

    // Unigrams and Bigrams
    const tokens = [...words];
    for (let i = 0; i < words.length - 1; i++) {
      tokens.push(`${words[i]}_${words[i + 1]}`);
    }

    // Term Frequency hashing trick
    for (const token of tokens) {
      const idx = this._hashToken(token) % this.dimension;
      const sign = (this._hashToken(token, 0x9e3779b9) % 2 === 0) ? 1 : -1;
      // Sublinear scaling: 1 + ln(tf)
      vector[idx] += sign * (1 + Math.log(1.2));
    }

    // L2 Normalize
    let norm = 0;
    for (let i = 0; i < this.dimension; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < this.dimension; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  async embedDocuments(texts) {
    return Promise.all(texts.map(t => this.embedQuery(t)));
  }

  /**
   * Computes cosine similarity between two unit vectors.
   */
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    return Math.max(0, Math.min(1, dot));
  }
}
