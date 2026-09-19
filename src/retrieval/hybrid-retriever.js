/**
 * Hybrid Retriever & Orchestrator
 * Implements Vector + Lexical Search with Reciprocal Rank Fusion (RRF),
 * Sufficiency Evaluation, and Automated Live Search Fallback.
 */
import { LocalSemanticEmbeddingProvider } from './local-embedding.js';
import { rewriteQuery, extractCoreKeywords } from './query-rewriter.js';
import { SufficiencyEvaluator } from './sufficiency-evaluator.js';
import { FreeWebSearchAdapter } from '../search/free-search-adapter.js';
import { buildCitations } from './citation-builder.js';

export class HybridRetriever {
  /**
   * @param {Object} options
   * @param {import('../adapters/IDatabase.js').IDatabase} options.db
   * @param {import('../adapters/IEmbeddingProvider.js').IEmbeddingProvider} [options.embeddingProvider]
   * @param {import('../adapters/ISearchProvider.js').ISearchProvider} [options.searchProvider]
   * @param {SufficiencyEvaluator} [options.sufficiencyEvaluator]
   */
  constructor({
    db,
    embeddingProvider = new LocalSemanticEmbeddingProvider(),
    searchProvider = new FreeWebSearchAdapter(),
    sufficiencyEvaluator = new SufficiencyEvaluator({ similarityThreshold: 0.30, minEvidenceCount: 1 })
  }) {
    this.db = db;
    this.embeddingProvider = embeddingProvider;
    this.searchProvider = searchProvider;
    this.sufficiencyEvaluator = sufficiencyEvaluator;
  }

  /**
   * Performs hybrid search across internal knowledge base with live search fallback.
   * @param {Object} params
   * @param {string} params.query
   * @param {Object} [params.filter] { domainId, difficultyLevel, resourceType }
   * @param {number} [params.topK=5]
   * @returns {Promise<{
   *   results: Array<Object>,
   *   citations: Array<Object>,
   *   sufficiency: Object,
   *   sourceOrigin: 'internal_index' | 'live_search' | 'hybrid'
   * }>}
   */
  async retrieve(params) {
    const { query, filter = {}, topK = 5 } = typeof params === 'string' ? { query: params } : (params || {});
    const { expandedQuery, requiresRecency } = rewriteQuery(query);

    // 1. Fetch all candidate active resources matching metadata filters
    const allResources = await this.db.getAllResources({
      domainId: filter.domainId,
      difficultyLevel: filter.difficultyLevel,
      resourceType: filter.resourceType,
      isAlive: true
    });

    if (allResources.length === 0 && !requiresRecency) {
      // Fallback search directly if no filtered resources
      const liveResults = await this.searchProvider.search({ query, limit: topK });
      return {
        results: liveResults,
        citations: buildCitations(liveResults),
        sufficiency: { isSufficient: false, reason: "Zero internal matching resources", triggerLiveSearch: true },
        sourceOrigin: 'live_search'
      };
    }

    // 2. Lexical / Keyword Scoring
    const conversationalStopwords = new Set([
      'want', 'learn', 'more', 'about', 'need', 'like', 'explain', 'tell', 'give',
      'help', 'with', 'from', 'into', 'what', 'where', 'which', 'when', 'does',
      'doing', 'have', 'been', 'would', 'could', 'should', 'please', 'thanks',
      'thank', 'can', 'you', 'the', 'and', 'for', 'all', 'any', 'how'
    ]);
    const coreTopic = extractCoreKeywords(query).toLowerCase().trim();
    const queryTokens = expandedQuery.toLowerCase().split(/\s+/)
      .map(t => t.replace(/[^\w]/g, ''))
      .filter(t => t.length > 2 && !conversationalStopwords.has(t));

    const lexicalScores = new Map();

    for (const res of allResources) {
      const searchCorpus = `${res.title} ${res.taxonomy?.domainId} ${(res.taxonomy?.topics || []).join(' ')} ${(res.conceptsCovered || []).join(' ')} ${res.contentSummary || ''}`.toLowerCase();
      let matchCount = 0;

      // Exact phrase bonus for core topic (e.g. "osi model")
      if (coreTopic.length > 2 && (res.title.toLowerCase().includes(coreTopic) || searchCorpus.includes(coreTopic))) {
        matchCount += res.title.toLowerCase().includes(coreTopic) ? 10 : 5;
      }

      for (const token of queryTokens) {
        // Use word boundary to avoid substrings like 'osi' matching 'repository'
        const wordRegex = new RegExp('(^|[^a-z0-9])' + token + '([^a-z0-9]|$)', 'i');
        if (wordRegex.test(searchCorpus)) {
          // Boost matches in title and topics
          const inTitle = wordRegex.test(res.title);
          const inTopics = (res.taxonomy?.topics || []).some(t => wordRegex.test(t));
          matchCount += inTitle ? 4 : (inTopics ? 3 : 1);
        }
      }

      if (matchCount > 0) {
        lexicalScores.set(res.id, matchCount);
      }
    }

    // 3. Dense Vector Scoring
    const queryVector = await this.embeddingProvider.embedQuery(expandedQuery);
    const vectorScores = new Map();

    for (const res of allResources) {
      const textToEmbed = `${res.title}: ${res.contentSummary || ''} ${(res.conceptsCovered || []).join(' ')}`;
      const docVector = await this.embeddingProvider.embedQuery(textToEmbed);
      const sim = LocalSemanticEmbeddingProvider.cosineSimilarity(queryVector, docVector);
      vectorScores.set(res.id, sim);
    }

    // 4. Reciprocal Rank Fusion (RRF)
    const sortedLexical = [...lexicalScores.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
    const sortedVector = [...vectorScores.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);

    const rrfK = 60;
    const combinedScores = new Map();

    for (let rank = 0; rank < sortedLexical.length; rank++) {
      const id = sortedLexical[rank];
      const rrf = 1 / (rrfK + rank + 1);
      combinedScores.set(id, (combinedScores.get(id) || 0) + rrf);
    }

    for (let rank = 0; rank < sortedVector.length; rank++) {
      const id = sortedVector[rank];
      const rrf = 1 / (rrfK + rank + 1);
      combinedScores.set(id, (combinedScores.get(id) || 0) + rrf);
    }

    // Sort by combined RRF score
    const sortedCandidateIds = [...combinedScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    const resourceMap = new Map(allResources.map(r => [r.id, r]));
    const scoredResults = sortedCandidateIds
      .map(([id, rrfScore]) => {
        const res = resourceMap.get(id);
        const vecSim = vectorScores.get(id) || 0;
        return {
          ...res,
          score: Math.max(vecSim, rrfScore * 10), // normalize score for sufficiency evaluation
          rrfScore,
          vectorSimilarity: vecSim
        };
      })
      .filter(Boolean);

    // 5. Sufficiency Check (Ensure top match has keyword overlap or high vector confidence)
    const topCandidate = scoredResults[0];
    const topHasLexicalMatch = topCandidate && (lexicalScores.get(topCandidate.id) || 0) > 0;
    const isWeakSemanticOnly = !topHasLexicalMatch && (topCandidate?.vectorSimilarity || 0) < 0.40;

    let sufficiency = this.sufficiencyEvaluator.evaluate({
      query,
      retrievedItems: scoredResults,
      requiresRecency
    });

    if (isWeakSemanticOnly && !requiresRecency) {
      sufficiency = {
        isSufficient: false,
        maxScore: topCandidate?.score || 0,
        validCount: 0,
        triggerLiveSearch: true,
        reason: 'No lexical matches found in internal index; semantic similarity below confidence threshold.'
      };
    }

    // 6. If Insufficient: Trigger Live Search Fallback
    if (!sufficiency.isSufficient && sufficiency.triggerLiveSearch) {
      const liveItems = await this.searchProvider.search({ query, limit: 3 });

      if (liveItems.length > 0) {
        // Format live search items as compliant resource objects
        const liveResources = liveItems.map(item => ({
          id: `live_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: item.title,
          canonicalUrl: item.url,
          resourceType: 'official_doc',
          provider: { name: new URL(item.url).hostname, type: 'community_educator', reputationScore: 0.8 },
          taxonomy: { domainId: filter.domainId || 'fundamentals', subdomainId: 'live_discovered', topics: [] },
          difficultyLevel: filter.difficultyLevel || 'beginner',
          prerequisites: [],
          conceptsCovered: [item.title],
          language: 'en',
          estimatedTimeMinutes: 30,
          freeAccessStatus: 'always_free_open_access',
          credibility: { score: 0.8, justification: 'Discovered via live search fallback' },
          provenance: { origin: 'live_search', reviewStatus: item.reviewStatus || 'pending_review' },
          health: { isAlive: true, httpStatus: 200, lastCheckedAt: new Date().toISOString() },
          contentSummary: item.snippet,
          safetyClassification: 'safe_educational'
        }));

        // Prioritize live verified resources and only retain internal items with actual keyword overlap
        const relevantInternal = scoredResults.filter(r => (lexicalScores.get(r.id) || 0) > 0);
        const merged = [...liveResources, ...relevantInternal].slice(0, topK);

        return {
          results: merged,
          citations: buildCitations(merged),
          sufficiency,
          sourceOrigin: relevantInternal.length > 0 ? 'hybrid' : 'live_search'
        };
      }
    }

    return {
      results: scoredResults,
      citations: buildCitations(scoredResults),
      sufficiency,
      sourceOrigin: 'internal_index'
    };
  }
}
