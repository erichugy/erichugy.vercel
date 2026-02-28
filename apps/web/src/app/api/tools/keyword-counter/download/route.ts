import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

import { getKeywordCounterJob } from "@/lib/keywordCounterJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const requestedFile = searchParams.get("file");

  if (!jobId || !requestedFile) {
    return NextResponse.json({ error: "jobId and file are required." }, { status: 400 });
  }

  const job = getKeywordCounterJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  const safeFileName = path.basename(requestedFile);
  if (safeFileName !== requestedFile) {
    return NextResponse.json({ error: "Invalid file name." }, { status: 400 });
  }

  const absoluteOutputDir = path.resolve(job.outputDir);
  const filePath = path.resolve(path.join(absoluteOutputDir, safeFileName));
  if (!filePath.startsWith(absoluteOutputDir)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const ext = path.extname(safeFileName).toLowerCase();
  const contentType = contentTypes[ext] || "application/octet-stream";

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
