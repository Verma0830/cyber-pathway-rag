/**
 * ISearchProvider - Abstract Interface for Live Web Search Providers
 * Allows DuckDuckGo, SearXNG, Tavily, Brave, or custom mock search
 * to be used interchangeably.
 */
export class ISearchProvider {
  constructor(name = 'base-search') {
    this.name = name;
  }

  /**
   * Performs web search for a query.
   * @param {Object} options
   * @param {string} options.query
   * @param {number} [options.limit=5]
   * @param {Array<string>} [options.domains] Allowed domains to focus search
   * @returns {Promise<Array<{title: string, url: string, snippet: string, publishedDate?: string}>>}
   */
  async search(options) {
    throw new Error(`search() not implemented on ${this.name}`);
  }

  /**
   * Validates if provider is reachable and active.
   * @returns {Promise<boolean>}
   */
  async ping() {
    throw new Error(`ping() not implemented on ${this.name}`);
  }
}
