import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireApiKey } from "@/services/auth";
import { deleteJob, getJobById, updateJob } from "@/services/job-tracker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

const updateJobSchema = z
  .object({
    jobTitle: z.string().trim().min(1).max(500).optional(),
    company: z.string().trim().min(1).max(300).optional(),
    jobDescription: z.string().trim().max(10000).optional(),
    datePosted: z.string().trim().optional(),
    dateApplied: z.string().trim().optional(),
    location: z.string().trim().max(300).optional(),
    link: z.string().trim().max(2000).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field is required.",
  });

export async function GET(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const job = await getJobById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ data: job });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch job." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  try {
    const job = await updateJob(id, parsed.data);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ data: job });
  } catch {
    return NextResponse.json(
      { error: "Failed to update job." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;

  try {
    const deleted = await deleteJob(id);
    if (!deleted) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete job." },
      { status: 500 },
    );
  }
}
