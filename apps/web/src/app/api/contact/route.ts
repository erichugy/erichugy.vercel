import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { sendWebhook } from "@/lib/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.email("Invalid email address").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

// Per-IP rate limiting — survives Next.js hot reload via globalThis
type RateEntry = { count: number; windowStart: number };

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

function isRateLimited(ip: string): boolean {
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Contact form temporarily unavailable." },
      { status: 503 },
    );
  }

  // NOTE: fall back to "anonymous" so requests without IP headers still get
  // rate-limited as a group, rather than bypassing the limit entirely
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")?.trim()
    || "anonymous";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = contactBodySchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  try {
    await sendWebhook(webhookUrl, { key: "contact-form", ...parsed.data });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
