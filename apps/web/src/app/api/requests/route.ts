import { NextResponse } from "next/server";

import { clearRequests, getRequests } from "@/lib/requestBinStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(getRequests());
}

export async function DELETE(): Promise<NextResponse> {
  clearRequests();
  return NextResponse.json({ message: "All requests cleared" });
}
