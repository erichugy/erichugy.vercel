import { NextResponse, type NextRequest } from "next/server";

export function requireApiKey(req: NextRequest): NextResponse | null {
  const apiKey = process.env.JOB_TRACKER_API_KEY;

  // TODO(auth): remove bypass — currently skips auth when no key is configured
  if (!apiKey) return null;

  const provided = req.headers.get("x-api-key");
  if (provided !== apiKey) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  return null;
}
