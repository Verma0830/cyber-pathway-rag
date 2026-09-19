/**
 * ILLMProvider - Abstract Interface for Language Model Providers
 * Ensures all LLM backends (Local Rule Engine, Ollama, Gemini Free Tier, OpenAI, etc.)
 * are completely interchangeable without changing application business logic.
 */
export class ILLMProvider {
  constructor(name = 'base-llm') {
    this.name = name;
  }

  /**
   * Generates a conversational response.
   * @param {Object} options
   * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} options.messages
   * @param {number} [options.temperature]
   * @param {number} [options.maxTokens]
   * @param {'text'|'json'} [options.responseFormat]
   * @returns {Promise<{content: string, usage?: {promptTokens: number, completionTokens: number}}>}
   */
  async generateChatCompletion(options) {
    throw new Error(`generateChatCompletion() not implemented on ${this.name}`);
  }

  /**
   * Synthesizes RAG evidence into grounded answers with citations.
   * Untrusted evidence is passed safely and citations mapped deterministically.
   * @param {Object} params
   * @param {string} params.query
   * @param {Array<{id: string, title: string, content: string, canonicalUrl: string, provenance: string}>} params.evidence
   * @param {Object} [params.userProfile]
   * @returns {Promise<{text: string, citations: Array<{refIndex: number, resourceId: string, title: string, canonicalUrl: string}>}>}
   */
  async synthesizeEvidence(params) {
    throw new Error(`synthesizeEvidence() not implemented on ${this.name}`);
  }

  /**
   * Checks provider availability and health.
   * @returns {Promise<{available: boolean, model: string, error?: string}>}
   */
  async checkHealth() {
    throw new Error(`checkHealth() not implemented on ${this.name}`);
  }
}
