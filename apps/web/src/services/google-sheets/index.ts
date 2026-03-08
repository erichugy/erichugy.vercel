import { google } from "googleapis";

import { type SheetConfig } from "./types";

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

function getClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export async function getRows(
  config: SheetConfig,
  range: string,
): Promise<unknown[][]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: `${config.tabName}!${range}`,
  });
  return (res.data.values as unknown[][] | undefined) ?? [];
}

export async function appendRow(
  config: SheetConfig,
  range: string,
  values: string[],
): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.tabName}!${range}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

export async function updateRow(
  config: SheetConfig,
  range: string,
  values: string[],
): Promise<void> {
  const sheets = getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: config.spreadsheetId,
    range: `${config.tabName}!${range}`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

export async function deleteRow(
  config: SheetConfig,
  rowIndex: number,
): Promise<void> {
  const sheets = getClient();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheetId,
  });

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === config.tabName,
  );
  if (!sheet) {
    throw new Error(`Sheet tab "${config.tabName}" not found`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: config.spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheet.properties!.sheetId!,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}
