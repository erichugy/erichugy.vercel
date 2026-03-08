import { NextResponse, type NextRequest } from "next/server";

// TODO(auth): remove bypass once API key enforcement is ready
const AUTH_BYPASS = process.env.NODE_ENV !== "production";

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
