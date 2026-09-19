/**
 * Sufficiency Evaluator
 * Evaluates whether internally retrieved RAG evidence meets quality,
 * confidence, and coverage thresholds before triggering live web search.
 */

export class SufficiencyEvaluator {
  /**
   * @param {Object} [options]
   * @param {number} [options.similarityThreshold=0.35]
   * @param {number} [options.minEvidenceCount=2]
   */
  constructor(options = {}) {
    this.similarityThreshold = options.similarityThreshold ?? 0.35;
    this.minEvidenceCount = options.minEvidenceCount ?? 2;
  }

  /**
   * Evaluates retrieved evidence against the query and sufficiency constraints.
   * @param {Object} params
   * @param {string} params.query
   * @param {Array<{id: string, score: number, title: string}>} params.retrievedItems
   * @param {boolean} [params.requiresRecency=false]
   * @returns {{
   *   isSufficient: boolean,
   *   maxScore: number,
   *   validCount: number,
   *   triggerLiveSearch: boolean,
   *   reason: string
   * }}
   */
  evaluate({ query, retrievedItems = [], requiresRecency = false }) {
    if (requiresRecency) {
      return {
        isSufficient: false,
        maxScore: retrievedItems[0]?.score || 0,
        validCount: retrievedItems.length,
        triggerLiveSearch: true,
        reason: "User requested latest/current intelligence; live web search triggered."
      };
    }

    if (!retrievedItems || retrievedItems.length === 0) {
      return {
        isSufficient: false,
        maxScore: 0,
        validCount: 0,
        triggerLiveSearch: true,
        reason: "Zero internal matching resources found in knowledge base."
      };
    }

    const maxScore = retrievedItems[0]?.score || 0;
    const qualifyingItems = retrievedItems.filter(item => item.score >= this.similarityThreshold);

    if (maxScore < this.similarityThreshold) {
      return {
        isSufficient: false,
        maxScore,
        validCount: qualifyingItems.length,
        triggerLiveSearch: true,
        reason: `Maximum similarity score (${maxScore.toFixed(3)}) fell below sufficiency threshold (${this.similarityThreshold}).`
      };
    }

    if (qualifyingItems.length < this.minEvidenceCount) {
      return {
        isSufficient: false,
        maxScore,
        validCount: qualifyingItems.length,
        triggerLiveSearch: true,
        reason: `Qualifying evidence count (${qualifyingItems.length}) below minimum required (${this.minEvidenceCount}).`
      };
    }

    return {
      isSufficient: true,
      maxScore,
      validCount: qualifyingItems.length,
      triggerLiveSearch: false,
      reason: "Internal knowledge base contains sufficient high-confidence evidence."
    };
  }
}
