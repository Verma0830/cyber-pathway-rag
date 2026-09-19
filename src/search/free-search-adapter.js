/**
 * Zero-Cost Live Web Search Adapter
 * Implements ISearchProvider. Queries open endpoints with rate limiting,
 * SSRF guards, and an automated authority domain whitelist.
 */
import { ISearchProvider } from '../adapters/ISearchProvider.js';
import { validateSafeUrl } from '../security/ssrf-guard.js';
import { extractCoreKeywords } from '../retrieval/query-rewriter.js';

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
  'openpolicyagent.org',
  'cloudflare.com',
  'wireshark.org',
  'nmap.org'
];

export const AUTHORITY_TOOLS_DIRECTORY = [
  { name: 'OSI Model Guide', keywords: ['osi', 'osi model', '7 layers', 'open systems interconnection'], title: 'Cloudflare Learning Center: What is the OSI Model? (7 Layers Explained)', url: 'https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/', snippet: 'Comprehensive architectural guide explaining the 7 layers of the OSI model, data encapsulation, protocols at each layer, and how security mechanisms operate.' },
  { name: 'Network Fundamentals', keywords: ['network+', 'networking fundamentals', 'tcp handshake', 'tcp ip'], title: 'Professor Messer CompTIA Network+ Training Course (Free Video Series)', url: 'https://www.professormesser.com/network-plus/n10-008/n10-008-training-course/', snippet: 'Full free modular training course covering computer networking fundamentals, the OSI model, TCP/IP, and packet analysis.' },
  { name: 'Wireshark', keywords: ['wireshark', 'packet', 'pcap', 'sniffing', 'network traffic'], title: 'Wireshark Official User Guide & Packet Analysis Documentation', url: 'https://www.wireshark.org/docs/wsug_html_chunked/', snippet: 'Comprehensive official guide to packet inspection, display filters, and protocol dissection with Wireshark.' },
  { name: 'Nmap', keywords: ['nmap', 'port scanning', 'network discovery', 'syn scan'], title: 'Nmap Reference Guide & Official Network Exploration Manual', url: 'https://nmap.org/book/man.html', snippet: 'Official reference documentation on port scanning techniques, OS detection, and NSE script engine.' },
  { name: 'Ghidra', keywords: ['ghidra', 'reverse engineering', 'decompiler', 'disassembly'], title: 'NSA Ghidra Software Reverse Engineering Framework', url: 'https://ghidra-sre.org/', snippet: 'Free, open-source software reverse engineering suite developed by the National Security Agency with decompilation.' },
  { name: 'Burp Suite Academy', keywords: ['burp', 'burp suite', 'web app security', 'repeater', 'proxy'], title: 'PortSwigger Web Security Academy (Free Burp Suite Labs)', url: 'https://portswigger.net/web-security', snippet: 'Interactive free browser labs covering SQLi, XSS, CSRF, and authentication bypasses with Burp Suite.' },
  { name: 'Bandit OverTheWire', keywords: ['bandit', 'overthewire', 'linux wargame', 'bash wargame'], title: 'OverTheWire: Bandit Wargame for Linux Fundamentals', url: 'https://overthewire.org/wargames/bandit/', snippet: 'Level-by-level hands-on wargame teaching Linux command line, file permissions, SSH, and basic scripting.' },
  { name: 'OWASP Juice Shop', keywords: ['juice shop', 'vulnerable app', 'insecure app'], title: 'OWASP Juice Shop: Modern Insecure Web Application Lab', url: 'https://owasp.org/www-project-juice-shop/', snippet: 'Entirely open-source, intentionally vulnerable web app for testing and learning the complete OWASP Top 10.' },
  { name: 'CyberChef', keywords: ['cyberchef', 'encoding', 'hex', 'base64', 'xor'], title: 'GCHQ CyberChef - The Cyber Swiss Army Knife', url: 'https://gchq.github.io/CyberChef/', snippet: 'Web app for encryption, encoding, compression, and data analysis developed by GCHQ.' },
  { name: 'Zeek', keywords: ['zeek', 'bro', 'network monitor', 'ids', 'nsm'], title: 'Zeek Network Security Monitor Documentation', url: 'https://docs.zeek.org/en/current/', snippet: 'Open-source network security monitoring platform for behavioral analysis and high-level traffic inspection.' },
  { name: 'Snort', keywords: ['snort', 'ids', 'ips', 'signature rules'], title: 'Snort 3 Official Intrusion Detection & Prevention Documentation', url: 'https://www.snort.org/documents', snippet: 'Official documentation and user manual for writing Snort packet inspection and alerting rules.' },
  { name: 'Volatility', keywords: ['volatility', 'memory forensics', 'ram analysis'], title: 'Volatility Foundation Memory Forensics Framework', url: 'https://volatilityfoundation.org/', snippet: 'Open collection of tools for the extraction of digital artifacts from volatile memory (RAM) samples.' },
  { name: 'CryptoHack', keywords: ['cryptohack', 'cryptography', 'rsa', 'aes'], title: 'CryptoHack: Fun Platform for Learning Modern Cryptography', url: 'https://cryptohack.org/', snippet: 'Free interactive challenges on modern cryptography, AES, RSA, elliptic curves, and cryptanalysis.' }
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
   * Multi-source live search: DuckDuckGo HTML -> Wikipedia OpenSearch -> Authority Directory.
   */
  async search({ query, limit = 5 }) {
    if (!query || query.trim().length === 0) return [];

    const results = [];
    const coreQuery = extractCoreKeywords(query);
    const queryLower = coreQuery.toLowerCase();
    const rawLower = query.toLowerCase();

    // 1. Check Authority Tools Directory for high-relevance direct matches
    for (const tool of AUTHORITY_TOOLS_DIRECTORY) {
      const matchesKeyword = tool.keywords.some(k => queryLower.includes(k) || rawLower.includes(k));
      if (matchesKeyword) {
        results.push({
          title: tool.title,
          url: tool.url,
          snippet: tool.snippet,
          provenance: 'live_search',
          reviewStatus: 'approved'
        });
      }
    }

    if (results.length >= limit) {
      return results.slice(0, limit);
    }

    // 2. Try DuckDuckGo HTML Search
    try {
      const encodedQuery = encodeURIComponent(coreQuery + ' cybersecurity documentation free');
      const endpoint = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

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
        const linkMatches = [...html.matchAll(/<a class="result__url" href="([^"]+)">/gi)];
        const snippetMatches = [...html.matchAll(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/gi)];
        const titleMatches = [...html.matchAll(/<a class="result__title"[^>]*>([\s\S]*?)<\/a>/gi)];

        for (let i = 0; i < linkMatches.length && results.length < limit; i++) {
          let rawUrl = linkMatches[i][1].trim();

          if (rawUrl.includes('uddg=')) {
            const match = rawUrl.match(/uddg=([^&]+)/);
            if (match) rawUrl = decodeURIComponent(match[1]);
          }

          if (!rawUrl.startsWith('http')) rawUrl = 'https://' + rawUrl;

          const ssrf = await validateSafeUrl(rawUrl);
          if (!ssrf.safe) continue;

          // Avoid duplicate URLs
          if (results.some(r => r.url === rawUrl)) continue;

          const title = titleMatches[i] ? titleMatches[i][1].replace(/<[^>]+>/g, '').trim() : `Resource: ${coreQuery}`;
          const snippet = snippetMatches[i] ? snippetMatches[i][1].replace(/<[^>]+>/g, '').trim() : 'Verified live cybersecurity resource.';

          results.push({
            title,
            url: rawUrl,
            snippet,
            provenance: 'live_search',
            reviewStatus: this.isWhitelistedAuthority(rawUrl) ? 'approved' : 'pending_review'
          });
        }
      }
    } catch {
      // Fallback to OpenSearch if DDG times out or is blocked
    }

    // 3. Fallback: Wikipedia Technical OpenSearch API (Never blocked, fast, highly authoritative)
    if (results.length < limit) {
      try {
        const wikiEndpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(coreQuery)}&limit=${limit}&namespace=0&format=json`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const wikiRes = await fetch(wikiEndpoint, {
          headers: { 'User-Agent': 'CyberPathwayBot/1.0 (Educational RAG)' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (wikiRes.ok) {
          const [term, titles, snippets, urls] = await wikiRes.json();
          for (let i = 0; i < titles.length && results.length < limit; i++) {
            const url = urls[i];
            if (!url || results.some(r => r.url === url)) continue;

            const ssrf = await validateSafeUrl(url);
            if (!ssrf.safe) continue;

            results.push({
              title: `${titles[i]} (Technical Overview & Specification)`,
              url: url,
              snippet: snippets[i] || `Detailed specification, architecture, and reference documentation for ${titles[i]}.`,
              provenance: 'live_search',
              reviewStatus: 'approved'
            });
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    return results.slice(0, limit);
  }
}
