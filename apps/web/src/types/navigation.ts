import { z } from "zod";

export const navLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});
export type NavLink = z.infer<typeof navLinkSchema>;

export const socialLinkSchema = z.object({
  name: z.string(),
  href: z.string(),
  icon: z.string(),
});
export type SocialLink = z.infer<typeof socialLinkSchema>;
