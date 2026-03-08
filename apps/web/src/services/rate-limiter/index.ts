import type { RateEntry } from "./types";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3;
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const globalState = globalThis as typeof globalThis & {
  __contactRateLimiter?: Map<string, RateEntry>;
  __contactRateLimiterCleanup?: ReturnType<typeof setInterval>;
};

const rateLimiter: Map<string, RateEntry> =
  globalState.__contactRateLimiter ?? new Map();
globalState.__contactRateLimiter = rateLimiter;

if (!globalState.__contactRateLimiterCleanup) {
  globalState.__contactRateLimiterCleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimiter) {
      if (now - entry.windowStart > WINDOW_MS) {
        rateLimiter.delete(ip);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  globalState.__contactRateLimiterCleanup.unref();
}

const MAX_RATE_ENTRIES = 10_000;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // NOTE: opportunistic cleanup — prune expired entries during each check
  // so memory stays bounded even if the periodic cleanup timer doesn't fire
  if (rateLimiter.size >= MAX_RATE_ENTRIES) {
    for (const [key, entry] of rateLimiter) {
      if (now - entry.windowStart > WINDOW_MS) {
        rateLimiter.delete(key);
      }
    }

    // NOTE: hard cap — evict oldest entries if map still over limit after expiry cleanup
    if (rateLimiter.size >= MAX_RATE_ENTRIES) {
      const keysIterator = rateLimiter.keys();
      while (rateLimiter.size >= MAX_RATE_ENTRIES) {
        const next = keysIterator.next();
        if (next.done) break;
        rateLimiter.delete(next.value);
      }
    }
  }

  const entry = rateLimiter.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimiter.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}
