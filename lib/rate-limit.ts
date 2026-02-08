/**
 * In-memory rate limiter for API routes.
 * Note: On serverless (Vercel), each instance has its own memory, so this
 * provides per-instance protection. For global rate limiting, use Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds to prevent memory leaks
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  store.forEach((entry, key) => {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  });
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // ms until reset
}

/**
 * Check if a request from the given identifier is within rate limits.
 * @param identifier - Unique key (e.g., IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetTime - now;

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetIn,
  };
}
