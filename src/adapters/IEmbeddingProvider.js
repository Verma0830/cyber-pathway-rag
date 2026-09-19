/**
 * IEmbeddingProvider - Abstract Interface for Vector Embedding Providers
 * Allows zero-cost local embeddings (@xenova/transformers / TF-IDF)
 * or external API embeddings to be swapped seamlessly.
 */
export class IEmbeddingProvider {
  constructor(name = 'base-embedding') {
    this.name = name;
  }

  /**
   * Generates embedding vector for a single query string.
   * @param {string} text
   * @returns {Promise<Float32Array|Array<number>>}
   */
  async embedQuery(text) {
    throw new Error(`embedQuery() not implemented on ${this.name}`);
  }

  /**
   * Generates embedding vectors for a batch of documents.
   * @param {Array<string>} texts
   * @returns {Promise<Array<Float32Array|Array<number>>>}
   */
  async embedDocuments(texts) {
    throw new Error(`embedDocuments() not implemented on ${this.name}`);
  }

  /**
   * Returns dimensionality of the vector space (e.g. 384 for MiniLM-L6, 1536 for OpenAI).
   * @returns {number}
   */
  getDimension() {
    throw new Error(`getDimension() not implemented on ${this.name}`);
  }
}
