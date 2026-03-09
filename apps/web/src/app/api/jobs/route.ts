import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireApiKey } from "@/services/auth";
import { appendJob, getAllJobs } from "@/services/job-tracker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createJobSchema = z.object({
  jobTitle: z.string().trim().min(1).max(500),
  company: z.string().trim().min(1).max(300),
  jobDescription: z.string().trim().max(10000).default(""),
  datePosted: z.string().trim().default(""),
  dateApplied: z.string().trim().optional(),
  location: z.string().trim().max(300).default(""),
  link: z.string().trim().max(2000).default(""),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authError = requireApiKey(req);
  if (authError) return authError;

  try {
    const jobs = await getAllJobs();
    return NextResponse.json({ data: jobs });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch jobs." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authError = requireApiKey(req);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { dateApplied, ...rest } = parsed.data;

  try {
    const job = await appendJob({
      ...rest,
      dateApplied: dateApplied || new Date().toISOString().split("T")[0]!,
    });
    return NextResponse.json({ data: job }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create job." },
      { status: 500 },
    );
  }
}
