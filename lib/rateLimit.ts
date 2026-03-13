/**
 * Generic in-memory IP rate limiter.
 * Uses a module-level Map so state persists across requests within the same
 * Node.js process. Resets on serverless cold-start — acceptable for this use case.
 *
 * Usage:
 *   const { allowed, retryAfter } = checkRateLimit(`${ip}:bookings`, 10, 60 * 60 * 1000);
 */

interface RateLimitEntry {
  count:   number;
  resetAt: number; // epoch ms
}

// Module-level store — survives across requests in the same process
const store = new Map<string, RateLimitEntry>();

/** Remove expired entries to prevent unbounded memory growth. */
function cleanup(): void {
  const now  = Date.now();
  const keys = Array.from(store.keys());
  for (const key of keys) {
    const entry = store.get(key);
    if (entry && entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

// Run cleanup every 5 minutes passively (only when checkRateLimit is called)
let lastCleanup = 0;
function maybeCleanup(): void {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) {
    cleanup();
    lastCleanup = now;
  }
}

/**
 * Check whether a key (e.g. "1.2.3.4:bookings") has exceeded the rate limit.
 *
 * @param key         Unique key — typically IP + endpoint
 * @param maxRequests Maximum allowed requests in the window
 * @param windowMs    Window duration in milliseconds
 * @returns           { allowed: true } or { allowed: false, retryAfter: seconds }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfter?: number } {
  maybeCleanup();

  const now    = Date.now();
  const record = store.get(key);

  if (!record || record.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}
