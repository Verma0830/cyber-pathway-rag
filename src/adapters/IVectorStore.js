/**
 * IVectorStore - Abstract Interface for Vector Databases
 * Supports vector similarity search (cosine, dot product, L2)
 * with metadata filtering.
 */
export class IVectorStore {
  constructor(name = 'base-vector-store') {
    this.name = name;
  }

  /**
   * Upsert a single vector with associated metadata.
   * @param {Object} item
   * @param {string} item.id
   * @param {Float32Array|Array<number>} item.vector
   * @param {Object} item.metadata
   * @returns {Promise<void>}
   */
  async upsert(item) {
    throw new Error(`upsert() not implemented on ${this.name}`);
  }

  /**
   * Upsert multiple vectors in a single batch.
   * @param {Array<{id: string, vector: Float32Array|Array<number>, metadata: Object}>} items
   * @returns {Promise<void>}
   */
  async upsertBatch(items) {
    throw new Error(`upsertBatch() not implemented on ${this.name}`);
  }

  /**
   * Performs top-K similarity search.
   * @param {Object} query
   * @param {Float32Array|Array<number>} query.vector
   * @param {number} [query.topK=5]
   * @param {Object} [query.filter] e.g. { domainId, difficultyLevel }
   * @returns {Promise<Array<{id: string, score: number, metadata: Object}>>}
   */
  async search(query) {
    throw new Error(`search() not implemented on ${this.name}`);
  }

  /**
   * Deletes a vector by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error(`delete() not implemented on ${this.name}`);
  }

  /**
   * Returns count of indexed items.
   * @returns {Promise<number>}
   */
  async count() {
    throw new Error(`count() not implemented on ${this.name}`);
  }
}
