import { NextResponse } from "next/server";

import { clearRequests, getRequests } from "@/lib/requestBinStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getRequests());
}

export async function DELETE() {
  clearRequests();
  return NextResponse.json({ message: "All requests cleared" });
}
