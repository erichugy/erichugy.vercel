import { NextResponse, type NextRequest } from "next/server";

// AUTH BYPASS — delete these two lines to enforce API key auth
const AUTH_BYPASS = true;

export function requireApiKey(req: NextRequest): NextResponse | null {
  if (AUTH_BYPASS) return null;

  const apiKey = process.env.JOB_TRACKER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Auth not configured." },
      { status: 503 },
    );
  }

  const provided = req.headers.get("x-api-key");
  if (provided !== apiKey) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  return null;
}
