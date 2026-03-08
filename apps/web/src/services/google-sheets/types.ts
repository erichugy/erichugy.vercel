import { z } from "zod";

const sheetConfigSchema = z.object({
  spreadsheetId: z.string(),
  tabName: z.string().default("Sheet1"),
});
export type SheetConfig = z.infer<typeof sheetConfigSchema>;
