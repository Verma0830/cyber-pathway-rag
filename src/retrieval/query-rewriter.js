/**
 * Cybersecurity Query Rewriter & Intent Analyzer
 * Expands cybersecurity abbreviations, extracts domain filters,
 * and detects temporal recency demands.
 */

const ACRONYM_EXPANSIONS = {
  'k8s': 'kubernetes container security',
  'sqli': 'sql injection database web security',
  'xss': 'cross site scripting web security',
  'ssrf': 'server side request forgery',
  'csrf': 'cross site request forgery',
  'dfir': 'digital forensics incident response memory disk',
  'soc': 'security operations center siem triage alerts',
  'edr': 'endpoint detection response telemetry',
  'siem': 'security information event management logs',
  'soar': 'security orchestration automation response',
  'cve': 'common vulnerabilities exposures cvss',
  'iam': 'identity access management authentication authorization',
  'pki': 'public key infrastructure certificates x509',
  'cti': 'cyber threat intelligence mitre attack adversary',
  'ad': 'active directory kerberos windows domain',
  'scada': 'industrial control systems ics modbus purdue',
  'iot': 'internet of things firmware embedded',
  'can': 'controller area network automotive car bus',
  'llm': 'large language model prompt injection ai security',
  'grc': 'governance risk compliance nist csf iso 27001'
};

const RECENCY_KEYWORDS = [
  'latest',
  'recent',
  'newest',
  'today',
  'this year',
  'current',
  'breaking',
  'cve-2024',
  'cve-2025',
  'cve-2026',
  'news'
];

/**
 * Analyzes and rewrites user queries for optimal hybrid retrieval.
 * @param {string} rawQuery
 * @returns {{
 *   originalQuery: string,
 *   expandedQuery: string,
 *   requiresRecency: boolean,
 *   inferredDomains: string[]
 * }}
 */
export function rewriteQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { originalQuery: '', expandedQuery: '', requiresRecency: false, inferredDomains: [] };
  }

  const clean = rawQuery.trim();
  const lower = clean.toLowerCase();

  // Check recency demand
  const requiresRecency = RECENCY_KEYWORDS.some(kw => lower.includes(kw));

  // Expand acronyms
  const words = lower.split(/\s+/);
  const expansions = [];

  for (const w of words) {
    const stripped = w.replace(/[^\w]/g, '');
    if (ACRONYM_EXPANSIONS[stripped]) {
      expansions.push(ACRONYM_EXPANSIONS[stripped]);
    }
  }

  const expandedQuery = expansions.length > 0
    ? `${clean} ${expansions.join(' ')}`
    : clean;

  return {
    originalQuery: clean,
    expandedQuery,
    requiresRecency,
    inferredDomains: []
  };
}
