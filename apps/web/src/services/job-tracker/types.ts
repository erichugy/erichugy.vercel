import { z } from "zod";

export const jobRowSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  jobDescription: z.string(),
  datePosted: z.string(),
  dateApplied: z.string(),
  location: z.string(),
  link: z.string(),
});
export type JobRow = z.infer<typeof jobRowSchema>;
