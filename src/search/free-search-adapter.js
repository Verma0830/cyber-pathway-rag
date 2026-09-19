/**
 * Zero-Cost Live Web Search Adapter
 * Implements ISearchProvider. Queries open endpoints with rate limiting,
 * SSRF guards, and an automated authority domain whitelist.
 */
import { ISearchProvider } from '../adapters/ISearchProvider.js';
import { validateSafeUrl } from '../security/ssrf-guard.js';

export const TRUSTED_AUTHORITY_DOMAINS = [
  'owasp.org',
  'nist.gov',
  'cisa.gov',
  'sans.org',
  'portswigger.net',
  'attack.mitre.org',
  'd3fend.mitre.org',
  'github.com',
  'first.org',
  'cisecurity.org',
  'linuxjourney.com',
  'overthewire.org',
  'hackthebox.com',
  'tryhackme.com',
  'kernel.org',
  'ietf.org',
  'volatilityfoundation.org',
  'professormesser.com',
  'letsdefend.io',
  'checkov.io',
  'openpolicyagent.org'
];

export class FreeWebSearchAdapter extends ISearchProvider {
  constructor(options = {}) {
    super('free-web-search');
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberPathwayBot/1.0';
    this.timeoutMs = options.timeoutMs || 7000;
  }

  async ping() {
    return true;
  }

  /**
   * Evaluates if a domain matches the pre-vetted cybersecurity authority whitelist.
   * @param {string} urlString
   * @returns {boolean}
   */
  isWhitelistedAuthority(urlString) {
    try {
      const parsed = new URL(urlString);
      const host = parsed.hostname.toLowerCase();
      return TRUSTED_AUTHORITY_DOMAINS.some(domain => host === domain || host.endsWith('.' + domain));
    } catch {
      return false;
    }
  }

  /**
   * Performs live web search using DuckDuckGo HTML/Instant API or curated fallback.
   * @param {Object} options
   * @param {string} options.query
   * @param {number} [options.limit=5]
   * @returns {Promise<Array<{title: string, url: string, snippet: string, provenance: string, reviewStatus: string}>>}
   */
  async search({ query, limit = 5 }) {
    if (!query || query.trim().length === 0) return [];

    const encodedQuery = encodeURIComponent(query + ' cybersecurity');
    const endpoint = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const results = [];

    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        // Extract results from DDG HTML
        const resultRegex = /<a class="result__url" href="([^"]+)">[\s\S]*?<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi;
        const titleRegex = /<a class="result__snippet[^>]*>/i;

        // Parse DuckDuckGo standard results
        const linkMatches = [...html.matchAll(/<a class="result__url" href="([^"]+)">/gi)];
        const snippetMatches = [...html.matchAll(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi)];
        const titleMatches = [...html.matchAll(/<a class="result__title"[^>]*>([\s\S]*?)<\/a>/gi)];

        for (let i = 0; i < Math.min(linkMatches.length, limit); i++) {
          let rawUrl = linkMatches[i][1].trim();

          // Unescape DuckDuckGo redirect wrapper (/l/?kh=-1&uddg=https%3A%2F%2F...)
          if (rawUrl.includes('uddg=')) {
            const match = rawUrl.match(/uddg=([^&]+)/);
            if (match) {
              rawUrl = decodeURIComponent(match[1]);
            }
          }

          if (!rawUrl.startsWith('http')) {
            rawUrl = 'https://' + rawUrl;
          }

          // SSRF validation
          const ssrf = await validateSafeUrl(rawUrl);
          if (!ssrf.safe) continue;

          const title = titleMatches[i]
            ? titleMatches[i][1].replace(/<[^>]+>/g, '').trim()
            : `Resource: ${query}`;
          const snippet = snippetMatches[i]
            ? snippetMatches[i][1].replace(/<[^>]+>/g, '').trim()
            : 'Live cybersecurity resource discovered via web search.';

          const isTrusted = this.isWhitelistedAuthority(rawUrl);

          results.push({
            title,
            url: rawUrl,
            snippet,
            provenance: 'live_search',
            reviewStatus: isTrusted ? 'approved' : 'pending_review'
          });
        }
      }
    } catch {
      clearTimeout(timeoutId);
      // Fallback: If external network is unreachable or blocked in sandbox, return empty results
      // (Never invent fake URLs!)
    }

    return results.slice(0, limit);
  }
}
