import { randomUUID } from "node:crypto";

import { appendRow, deleteRow, getRows, updateRow } from "@/services/google-sheets";
import { type SheetConfig } from "@/services/google-sheets/types";

import { jobRowSchema, type JobRow } from "./types";

const COLUMNS = [
  "id",
  "jobTitle",
  "company",
  "jobDescription",
  "datePosted",
  "dateApplied",
  "location",
  "link",
] as const;

function getConfig(): SheetConfig {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID not configured");
  return {
    spreadsheetId,
    tabName: process.env.GOOGLE_SHEETS_TAB_NAME ?? "Sheet1",
  };
}

function rowToJob(row: string[]): JobRow {
  const raw = Object.fromEntries(
    COLUMNS.map((col, i) => [col, row[i] ?? ""]),
  );
  return jobRowSchema.parse(raw);
}

function jobToRow(job: JobRow): string[] {
  return COLUMNS.map((col) => job[col]);
}

export async function getAllJobs(): Promise<JobRow[]> {
  const rows = await getRows(getConfig(), "A2:H");
  return rows.map(rowToJob);
}

export async function getJobById(id: string): Promise<JobRow | null> {
  const config = getConfig();
  const rowNum = await findRowNumber(config, id);
  if (!rowNum) return null;

  const rows = await getRows(config, `A${rowNum}:H${rowNum}`);
  const row = rows[0];
  if (!row) return null;

  return rowToJob(row);
}

export async function appendJob(job: Omit<JobRow, "id">): Promise<JobRow> {
  const id = randomUUID();
  const fullJob: JobRow = { id, ...job };
  await appendRow(getConfig(), "A:H", jobToRow(fullJob));
  return fullJob;
}

// NOTE: findRowNumber + subsequent mutation is not atomic — concurrent
// requests can shift row numbers between lookup and write. Acceptable
// for a low-traffic personal tool; use a real database if this matters.
async function findRowNumber(config: SheetConfig, id: string): Promise<number | null> {
  const rows = await getRows(config, "A:A");
  // Skip header row (index 0); return 1-indexed sheet row number
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[0] === id) return i + 1;
  }
  return null;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<JobRow, "id">>,
): Promise<JobRow | null> {
  const config = getConfig();
  const rowNum = await findRowNumber(config, id);
  if (!rowNum) return null;

  const currentRows = await getRows(config, `A${rowNum}:H${rowNum}`);
  const currentRow = currentRows[0];
  if (!currentRow) return null;

  const current = rowToJob(currentRow);
  const updated: JobRow = { ...current, ...updates, id };

  await updateRow(config, `A${rowNum}:H${rowNum}`, jobToRow(updated));
  return updated;
}

export async function deleteJob(id: string): Promise<boolean> {
  const config = getConfig();
  const rowNum = await findRowNumber(config, id);
  if (!rowNum) return false;
  await deleteRow(config, rowNum);
  return true;
}
