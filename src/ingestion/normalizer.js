/**
 * Text & HTML Content Normalizer
 * Cleans extracted text, strips navigation and ads, preserves document hierarchy,
 * and generates cryptographic and lexical fingerprint hashes for duplicate detection.
 */
import crypto from 'node:crypto';

/**
 * Strips boilerplate, HTML tags, and navigation artifacts from raw text/HTML.
 * @param {string} rawHtmlOrText
 * @returns {string} Cleaned structured plain text
 */
export function normalizeContent(rawHtmlOrText) {
  if (!rawHtmlOrText || typeof rawHtmlOrText !== 'string') return '';

  let cleaned = rawHtmlOrText;

  // 1. Remove script, style, nav, footer, and header blocks
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  cleaned = cleaned.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');
  cleaned = cleaned.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ');
  cleaned = cleaned.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ');

  // 2. Convert common block tags to newlines
  cleaned = cleaned.replace(/<\/(p|div|section|article|h[1-6]|li)>/gi, '\n');
  cleaned = cleaned.replace(/<br\s*[\/]?>/gi, '\n');

  // 3. Strip remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // 4. Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 5. Normalize whitespace and empty lines
  cleaned = cleaned
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n');

  return cleaned;
}

/**
 * Computes exact SHA-256 hash of normalized text.
 * @param {string} text
 * @returns {string} Hexadecimal SHA-256 hash
 */
export function computeContentHash(text) {
  const norm = normalizeContent(text).toLowerCase();
  return crypto.createHash('sha256').update(norm).digest('hex');
}

/**
 * Computes 3-gram word shingles for near-duplicate Jaccard similarity estimation.
 * @param {string} text
 * @returns {Set<string>}
 */
export function getWordShingles(text, k = 3) {
  const words = normalizeContent(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const shingles = new Set();
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return shingles;
}

/**
 * Calculates Jaccard similarity coefficient between two texts (0.0 to 1.0).
 * @param {string} textA
 * @param {string} textB
 * @returns {number}
 */
export function computeSimilarity(textA, textB) {
  const sA = getWordShingles(textA);
  const sB = getWordShingles(textB);

  if (sA.size === 0 || sB.size === 0) return 0.0;

  let intersection = 0;
  for (const item of sA) {
    if (sB.has(item)) intersection++;
  }

  const union = sA.size + sB.size - intersection;
  return union > 0 ? intersection / union : 0.0;
}
