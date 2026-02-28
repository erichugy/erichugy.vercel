import { NextResponse } from "next/server";

import { createKeywordCounterJob, getKeywordCounterJob } from "@/lib/keywordCounterJobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const pat = String(body.pat || "").trim();
  const botId = String(body.botId || "").trim();
  const keywords = String(body.keywords || "").trim();
  const startDate = String(body.startDate || "").trim();
  const endDate = String(body.endDate || "").trim();
  const verbose = Boolean(body.verbose);

  if (!pat || !botId || !keywords || !startDate) {
    return NextResponse.json(
      {
        error: "pat, botId, keywords, and startDate are required.",
      },
      { status: 400 },
    );
  }

  const job = createKeywordCounterJob({
    pat,
    botId,
    keywords,
    startDate,
    endDate,
    verbose,
  });

  return NextResponse.json({ jobId: job.id });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required." }, { status: 400 });
  }

  const job = getKeywordCounterJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    progress: job.progress,
    error: job.error,
    summaryText: job.summaryText,
    summary: job.summary,
    messageMatchesCount: job.messageMatchesCount,
    messageMatchesPreview: job.messageMatchesPreview,
    previewTruncated: job.messageMatchesCount > job.messageMatchesPreview.length,
    files: job.files.map((file) => ({
      name: file.name,
      size: file.size,
      downloadUrl: `/api/tools/keyword-counter/download?jobId=${job.id}&file=${encodeURIComponent(file.name)}`,
    })),
  });
}
