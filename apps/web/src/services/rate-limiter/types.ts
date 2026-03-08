import { z } from "zod";

export const rateEntrySchema = z.object({
  count: z.number(),
  windowStart: z.number(),
});
export type RateEntry = z.infer<typeof rateEntrySchema>;
