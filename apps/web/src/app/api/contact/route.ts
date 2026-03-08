import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { sendWebhook } from "@/lib/botpress/webhook";
import { isRateLimited } from "@/services/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.email("Invalid email address").max(254),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

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
