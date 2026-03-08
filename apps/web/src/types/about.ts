import { z } from "zod";

export const workExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  duration: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  highlights: z.array(z.string()),
});
export type WorkExperience = z.infer<typeof workExperienceSchema>;

export const volunteerEntrySchema = z.object({
  role: z.string(),
  organization: z.string(),
  duration: z.string(),
  description: z.string(),
});
export type VolunteerEntry = z.infer<typeof volunteerEntrySchema>;

export const educationEntrySchema = z.object({
  school: z.string(),
  degree: z.string(),
  duration: z.string(),
  gpa: z.string().optional(),
  awards: z.array(z.string()).optional(),
  coursework: z.array(z.string()).optional(),
  clubs: z.array(z.string()).optional(),
  volunteer: z.array(z.lazy(() => volunteerEntrySchema)).optional(),
});
export type EducationEntry = z.infer<typeof educationEntrySchema>;

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  credentialId: z.string().optional(),
});
export type Certification = z.infer<typeof certificationSchema>;

export const activitySchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});
export type Activity = z.infer<typeof activitySchema>;

export const languageSchema = z.object({
  name: z.string(),
  level: z.string(),
  details: z.string(),
});
export type Language = z.infer<typeof languageSchema>;
