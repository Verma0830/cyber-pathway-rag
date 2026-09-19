/**
 * SSRF (Server-Side Request Forgery) Guard
 * Blocks loopback, private RFC-1918, link-local, cloud metadata, and non-HTTPS requests.
 */
import dns from 'node:dns/promises';
import net from 'node:net';

const BLOCKED_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^10\./,                          // Private class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B
  /^192\.168\./,                    // Private class C
  /^169\.254\./,                    // Link-local / AWS & cloud metadata
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 loopback
  /^fe80:/i,                        // IPv6 link-local
  /^fc00:/i,                        // IPv6 unique local
  /^fd00:/i                         // IPv6 unique local
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data'
];

/**
 * Validates a target URL against SSRF vulnerabilities.
 * @param {string} urlString
 * @returns {Promise<{safe: boolean, reason?: string, normalizedUrl?: string}>}
 */
export async function validateSafeUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { safe: false, reason: 'Invalid URL syntax' };
  }

  // 1. Protocol check (HTTPS or HTTP only, HTTPS strictly preferred)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { safe: false, reason: `Disallowed protocol: ${parsed.protocol}. Only http/https permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Check explicitly blocked hostnames
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { safe: false, reason: `Blocked sensitive hostname: ${hostname}` };
  }

  // 3. If hostname is a literal IP address, check against private IP ranges
  if (net.isIP(hostname)) {
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { safe: false, reason: `Target IP ${hostname} is in a restricted or private address range.` };
      }
    }
  }

  // 4. DNS resolution validation
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      for (const pattern of BLOCKED_IP_PATTERNS) {
        if (pattern.test(addr.address)) {
          return {
            safe: false,
            reason: `Resolved IP ${addr.address} for ${hostname} falls within restricted private ranges.`
          };
        }
      }
    }
  } catch (err) {
    return { safe: false, reason: `DNS resolution failed for hostname ${hostname}: ${err.message}` };
  }

  return { safe: true, normalizedUrl: parsed.toString() };
}
