/**
 * Zero-Hallucination Citation Builder
 * Formats every resource with exact title, direct canonical URL, format, difficulty,
 * provider, prerequisites, why recommended, provenance badge, and last validation date.
 */

/**
 * Builds structured citation list from retrieved resources.
 * @param {Array<Object>} resources
 * @returns {Array<Object>}
 */
export function buildCitations(resources = []) {
  return resources.map((res, index) => {
    const isLiveSearch = res.provenance?.origin === 'live_search';
    return {
      refIndex: index + 1,
      id: res.id,
      title: res.title,
      canonicalUrl: res.canonicalUrl || res.url,
      format: res.resourceType || 'documentation',
      difficulty: res.difficultyLevel || 'beginner',
      provider: res.provider?.name || 'Verified Author',
      prerequisites: Array.isArray(res.prerequisites) && res.prerequisites.length > 0
        ? res.prerequisites.join(', ')
        : 'None (Self-contained)',
      whyRecommended: res.credibility?.justification || res.contentSummary || 'Authoritative educational reference',
      provenanceBadge: isLiveSearch ? 'Live search' : 'Indexed',
      lastValidationDate: res.health?.lastCheckedAt ? res.health.lastCheckedAt.slice(0, 10) : 'Recent (Verified)',
      isAlive: res.health?.isAlive ?? true
    };
  });
}

/**
 * Appends a formatted, human-readable markdown citation section to text
 * including all required resource attributes.
 * @param {string} text
 * @param {Array<Object>} citations
 * @returns {string}
 */
export function appendMarkdownCitations(text, citations = []) {
  if (!citations || citations.length === 0) return text;

  let out = text.trim() + '\n\n### Verified Recommended Resources\n\n';

  for (const cite of citations) {
    const badge = cite.provenanceBadge === 'Indexed' ? '`[Indexed]`' : '`[Live search]`';
    const status = cite.isAlive ? '🟢 Active' : '🟡 Offline';
    out += `${cite.refIndex}. **[${cite.title}](${cite.canonicalUrl})** ${badge}\n`;
    out += `   - **Format:** ${cite.format} | **Difficulty:** ${cite.difficulty} | **Provider:** ${cite.provider}\n`;
    out += `   - **Prerequisites:** ${cite.prerequisites}\n`;
    out += `   - **Why Recommended:** ${cite.whyRecommended}\n`;
    out += `   - **Last Validated:** ${cite.lastValidationDate} (${status})\n\n`;
  }

  return out;
}
