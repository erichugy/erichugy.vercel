import { type NextRequest, NextResponse } from "next/server";

import { captureFromNextRequest } from "@/lib/request-bin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

async function handle(request: NextRequest): Promise<NextResponse> {
  const captured = await captureFromNextRequest(request, "/requests/send");
  return NextResponse.json(
    { message: "Request captured", id: captured.id, timestamp: captured.timestamp },
    { headers: corsHeaders },
  );
}

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}
export async function PUT(request: NextRequest) {
  return handle(request);
}
export async function DELETE(request: NextRequest) {
  return handle(request);
}
export async function PATCH(request: NextRequest) {
  return handle(request);
}
export async function HEAD(request: NextRequest) {
  return handle(request);
}
export async function OPTIONS(request: NextRequest) {
  return handle(request);
}
