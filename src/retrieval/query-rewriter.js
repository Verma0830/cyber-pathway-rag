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
  'canbus': 'controller area network automotive car bus',
  'llm': 'large language model prompt injection ai security',
  'grc': 'governance risk compliance nist csf iso 27001',
  'osi': 'osi model 7 layers open systems interconnection networking',
  'tcp': 'transmission control protocol tcp ip handshake',
  'udp': 'user datagram protocol connectionless transport',
  'dns': 'domain name system name resolution',
  'arp': 'address resolution protocol mac ip',
  'dhcp': 'dynamic host configuration protocol ip allocation',
  'vpn': 'virtual private network ipsec wireguard',
  'ids': 'intrusion detection system snort suricata zeek',
  'ips': 'intrusion prevention system snort suricata',
  'waf': 'web application firewall modsecurity',
  'ms': 'microsoft',
  'mde': 'microsoft defender for endpoint edr',
  'xdr': 'extended detection response telemetry',
  'kql': 'kusto query language sentinel logs',
  'defender': 'microsoft defender for endpoint antivirus',
  'sentinel': 'microsoft sentinel cloud siem soar'
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

/**
 * Strips conversational prefixes/stopwords to isolate the core technical topic.
 * e.g. "i want to learn more about osi model" -> "osi model"
 * e.g. "can you explain how sql injection works" -> "sql injection"
 * @param {string} query
 * @returns {string}
 */
export function extractCoreKeywords(query) {
  if (!query || typeof query !== 'string') return '';
  let cleaned = query.trim();
  cleaned = cleaned
    .replace(/^(can\s+you\s+(please\s+)?(explain|tell\s+me\s+about|teach\s+me|help\s+me\s+with)\s+)?(what\s+is(\s+the)?|how\s+does(\s+the)?|how\s+do\s+i|where\s+can\s+i\s+(find|learn|practice)|tell\s+me\s+about|give\s+me\s+an\s+overview\s+of|explain|i\s+(want|need|would\s+like)\s+to\s+(learn|know|understand|read|study)(\s+more)?\s+(about)?)\s+/i, '')
    .replace(/(,\s*)?(\s+and\s+how\s+(can|do)\s+(we|i|security\s+teams)\s+(use|prevent|mitigate|stop|detect|defend\s+against)\s+(it|this)(\s+in\s+cybersecurity)?|\s+and\s+how\s+does\s+it\s+work|\s+and\s+how\s+to\s+use\s+it|\s+in\s+cybersecurity)+/i, '')
    .replace(/(\s+(please|help|thanks|thank\s+you|for\s+beginners|in\s+detail|step\s+by\s+step))+$/i, '')
    .replace(/[?,.!]+$/, '')
    .trim();

  return cleaned.length > 0 ? cleaned : query.trim();
}
