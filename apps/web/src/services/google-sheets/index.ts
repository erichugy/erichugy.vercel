import { google } from "googleapis";

import { type JobRow } from "./types";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error("Google Sheets credentials not configured");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      // Vercel stores the key with literal \n — convert to real newlines
      private_key: key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("GOOGLE_SHEETS_ID not configured");
  return id;
}

function getTabName() {
  return process.env.GOOGLE_SHEETS_TAB_NAME ?? "Sheet1";
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

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

function rowToJob(row: string[]): JobRow {
  return {
    id: row[0] ?? "",
    jobTitle: row[1] ?? "",
    company: row[2] ?? "",
    jobDescription: row[3] ?? "",
    datePosted: row[4] ?? "",
    dateApplied: row[5] ?? "",
    location: row[6] ?? "",
    link: row[7] ?? "",
  };
}

function jobToRow(job: JobRow): string[] {
  return COLUMNS.map((col) => job[col]);
}

export async function getAllJobs(): Promise<JobRow[]> {
  const sheets = getSheetsClient();
  const tab = getTabName();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tab}!A2:H`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => rowToJob(row as string[]));
}

export async function getJobById(id: string): Promise<JobRow | null> {
  const jobs = await getAllJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

export async function appendJob(
  job: Omit<JobRow, "id">,
): Promise<JobRow> {
  const sheets = getSheetsClient();
  const tab = getTabName();
  const id = crypto.randomUUID();

  const fullJob: JobRow = { id, ...job };

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${tab}!A:H`,
    valueInputOption: "RAW",
    requestBody: {
      values: [jobToRow(fullJob)],
    },
  });

  return fullJob;
}

async function findRowNumber(id: string): Promise<number | null> {
  const sheets = getSheetsClient();
  const tab = getTabName();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tab}!A:A`,
  });

  const rows = res.data.values;
  if (!rows) return null;

  // Row 0 in values = row 1 in sheet (header), so data starts at index 1
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[0] === id) return i + 1; // 1-indexed sheet row
  }

  return null;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<JobRow, "id">>,
): Promise<JobRow | null> {
  const sheets = getSheetsClient();
  const tab = getTabName();

  const rowNum = await findRowNumber(id);
  if (!rowNum) return null;

  // Fetch the current row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tab}!A${rowNum}:H${rowNum}`,
  });

  const currentRow = res.data.values?.[0] as string[] | undefined;
  if (!currentRow) return null;

  const current = rowToJob(currentRow);
  const updated: JobRow = { ...current, ...updates, id };

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${tab}!A${rowNum}:H${rowNum}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [jobToRow(updated)],
    },
  });

  return updated;
}

export async function deleteJob(id: string): Promise<boolean> {
  const sheets = getSheetsClient();
  const sheetId = getSheetId();

  const rowNum = await findRowNumber(id);
  if (!rowNum) return false;

  // Get the numeric sheet ID (not the spreadsheet ID)
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
  });

  const tab = getTabName();
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === tab,
  );
  const numericSheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: numericSheetId,
              dimension: "ROWS",
              startIndex: rowNum - 1, // 0-indexed
              endIndex: rowNum,
            },
          },
        },
      ],
    },
  });

  return true;
}
