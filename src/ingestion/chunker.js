/**
 * Semantic Document Chunker
 * Chunks documents while preserving section headings, paragraph cohesion,
 * and propagating canonical metadata to every chunk.
 */

/**
 * Splits document content into structured chunks with heading breadcrumbs.
 * @param {Object} params
 * @param {string} params.resourceId
 * @param {string} params.text
 * @param {Object} params.metadata { domainId, title, canonicalUrl, difficultyLevel }
 * @param {number} [params.maxWords=350]
 * @param {number} [params.overlapWords=50]
 * @returns {Array<Object>} Array of structured chunk objects
 */
export function chunkDocument({
  resourceId,
  text,
  metadata = {},
  maxWords = 350,
  overlapWords = 50
}) {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split('\n');
  const chunks = [];

  let currentHeading = metadata.title || 'General';
  let currentWords = [];
  let chunkIndex = 0;

  function flushChunk() {
    if (currentWords.length === 0) return;

    const chunkText = currentWords.join(' ').trim();
    if (chunkText.length > 0) {
      chunks.push({
        id: `${resourceId}_chunk_${chunkIndex}`,
        resourceId,
        chunkIndex,
        heading: currentHeading,
        text: chunkText,
        wordCount: currentWords.length,
        metadata: {
          ...metadata,
          heading: currentHeading
        }
      });
      chunkIndex++;
    }

    // Keep overlap from previous words
    if (overlapWords > 0 && currentWords.length > overlapWords) {
      currentWords = currentWords.slice(-overlapWords);
    } else {
      currentWords = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a heading
    const isHeading = /^#{1,4}\s+/.test(trimmed) ||
                      (/^[A-Z0-9\s-]{4,50}:?$/.test(trimmed) && trimmed.length < 50);

    if (isHeading) {
      // Flush previous chunk before starting new section
      flushChunk();
      currentHeading = trimmed.replace(/^#{1,4}\s+/, '');
      continue;
    }

    const words = trimmed.split(/\s+/);
    currentWords.push(...words);

    if (currentWords.length >= maxWords) {
      flushChunk();
    }
  }

  // Flush remaining words
  if (currentWords.length > 0) {
    flushChunk();
  }

  return chunks;
}
