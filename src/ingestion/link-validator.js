/**
 * Link Health & Paywall Validator
 * Verifies live reachability, latency, redirects, and accessibility without SSRF risks.
 */
import { validateSafeUrl } from '../security/ssrf-guard.js';

const PAYWALL_SIGNATURES = [
  /subscribe\s+to\s+(read|continue)/i,
  /purchase\s+access/i,
  /members-only\s+story/i,
  /behind\s+a\s+paywall/i,
  /enter\s+credit\s+card/i
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CyberPathwayAdvisor/1.0 (+https://github.com/cyber-pathway-rag)';

/**
 * Validates link health and returns comprehensive diagnostics.
 * @param {string} url
 * @param {number} [timeoutMs=8000]
 * @returns {Promise<{isAlive: boolean, httpStatus: number, redirectUrl: string|null, responseTimeMs: number, isPaywalled: boolean, error?: string}>}
 */
export async function validateLinkHealth(url, timeoutMs = 8000) {
  const ssrfCheck = await validateSafeUrl(url);
  if (!ssrfCheck.safe) {
    return {
      isAlive: false,
      httpStatus: 400,
      redirectUrl: null,
      responseTimeMs: 0,
      isPaywalled: false,
      error: `SSRF Blocked: ${ssrfCheck.reason}`
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Attempt GET with limited byte range or headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const isAlive = response.status >= 200 && response.status < 400;
    const finalUrl = response.url !== url ? response.url : null;

    let isPaywalled = false;
    // Inspect a small preview chunk of text if HTML to check for paywall markers
    const contentType = response.headers.get('content-type') || '';
    if (isAlive && contentType.includes('text/html')) {
      try {
        const textSample = await response.text();
        const snippet = textSample.slice(0, 5000);
        for (const pattern of PAYWALL_SIGNATURES) {
          if (pattern.test(snippet)) {
            isPaywalled = true;
            break;
          }
        }
      } catch {
        // Stream read error, ignore snippet
      }
    }

    return {
      isAlive,
      httpStatus: response.status,
      redirectUrl: finalUrl,
      responseTimeMs,
      isPaywalled,
      error: isAlive ? undefined : `HTTP status ${response.status}`
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const isTimeout = err.name === 'AbortError';

    return {
      isAlive: false,
      httpStatus: isTimeout ? 408 : 503,
      redirectUrl: null,
      responseTimeMs,
      isPaywalled: false,
      error: isTimeout ? `Connection timed out after ${timeoutMs}ms` : err.message
    };
  }
}
