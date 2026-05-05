import type { NavLink, SocialLink } from "@/types/navigation";

export type { NavLink, SocialLink } from "@/types/navigation";

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Tools", href: "/tools" },
  { label: "Hobbies", href: "/hobbies" },
  { label: "Contact", href: "/#contact" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/erichugy/", icon: "in" },
  { name: "GitHub", href: "https://github.com/erichugy/", icon: "github" },
];
