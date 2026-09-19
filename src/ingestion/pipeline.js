/**
 * Ingestion Pipeline Orchestrator
 * Coordinates schema validation, content normalization, deduplication,
 * semantic chunking, and database persistence.
 */
import { validateResource, createResource } from '../models/resource-schema.js';
import { normalizeContent, computeContentHash } from './normalizer.js';
import { chunkDocument } from './chunker.js';

export class IngestionPipeline {
  /**
   * @param {Object} options
   * @param {import('../adapters/IDatabase.js').IDatabase} options.db
   * @param {import('../adapters/IEmbeddingProvider.js').IEmbeddingProvider} [options.embeddingProvider]
   */
  constructor({ db, embeddingProvider = null }) {
    this.db = db;
    this.embeddingProvider = embeddingProvider;
  }

  /**
   * Ingests a single resource record.
   * @param {Object} rawData
   * @returns {Promise<{success: boolean, resource?: Object, chunksCount: number, error?: string}>}
   */
  async ingestResource(rawData) {
    try {
      // 1. Normalize and validate resource
      const resource = createResource(rawData);
      const validation = validateResource(resource);
      if (!validation.valid) {
        return { success: false, chunksCount: 0, error: `Validation errors: ${validation.errors.join('; ')}` };
      }

      // 2. Check for duplicate content hash or existing URL
      const existingByUrl = await this.db.getResourceByUrl(resource.canonicalUrl);
      if (existingByUrl && existingByUrl.id !== resource.id) {
        return {
          success: false,
          chunksCount: 0,
          error: `Duplicate resource: URL already indexed under ID ${existingByUrl.id}`
        };
      }

      // 3. Normalize summary/content
      const normalizedSummary = normalizeContent(resource.contentSummary || resource.title);
      resource.contentHash = computeContentHash(normalizedSummary);

      // 4. Persist resource in DB
      await this.db.insertResource(resource);

      // 5. Semantic Chunking
      const chunks = chunkDocument({
        resourceId: resource.id,
        text: `${resource.title}\n\n${normalizedSummary}\n\nConcepts: ${resource.conceptsCovered.join(', ')}`,
        metadata: {
          title: resource.title,
          domainId: resource.taxonomy.domainId,
          canonicalUrl: resource.canonicalUrl,
          difficultyLevel: resource.difficultyLevel
        }
      });

      // 6. Generate and save vector embeddings if provider is configured
      if (this.embeddingProvider && chunks.length > 0) {
        const textToEmbed = `${resource.title}: ${normalizedSummary}`;
        const vector = await this.embeddingProvider.embedQuery(textToEmbed);
        await this.db.saveVector(resource.id, vector);
      }

      return {
        success: true,
        resource,
        chunksCount: chunks.length
      };
    } catch (err) {
      return {
        success: false,
        chunksCount: 0,
        error: err.message
      };
    }
  }

  /**
   * Batch ingest an array of resources.
   * @param {Array<Object>} resourcesList
   * @returns {Promise<{total: number, successful: number, failed: number, errors: Array<{id: string, error: string}>}>}
   */
  async ingestBatch(resourcesList) {
    let successful = 0;
    let failed = 0;
    const errors = [];

    for (const item of resourcesList) {
      const res = await this.ingestResource(item);
      if (res.success) {
        successful++;
      } else {
        failed++;
        errors.push({ id: item.id || item.title || 'unknown', error: res.error });
      }
    }

    return {
      total: resourcesList.length,
      successful,
      failed,
      errors
    };
  }
}
