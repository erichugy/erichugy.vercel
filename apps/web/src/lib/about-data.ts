// ── Types ──────────────────────────────────────────────────────────────────

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  techStack: string[];
  highlights: string[];
}

export interface VolunteerWork {
  organization: string;
  role: string;
  duration: string;
  description: string;
}

export interface Activity {
  title: string;
  description: string;
  icon: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: "Acme Corp",
    position: "Full Stack Developer",
    duration: "Jan 2024 - Present",
    description:
      "Building and maintaining customer-facing web applications serving thousands of daily users.",
    techStack: ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    highlights: [
      "Led migration from legacy CRA app to Next.js, improving LCP by 40%",
      "Designed and implemented a real-time notification system",
      "Mentored two junior developers through onboarding",
    ],
  },
  {
    company: "Startup Labs",
    position: "Frontend Engineer",
    duration: "Jun 2023 - Dec 2023",
    description:
      "Developed the frontend for an early-stage SaaS product from zero to launch.",
    techStack: ["React", "TypeScript", "Zustand", "Tailwind CSS", "Vite"],
    highlights: [
      "Shipped MVP in 8 weeks, onboarding 200+ beta users",
      "Built a reusable component library shared across three products",
      "Implemented end-to-end tests with Playwright, reaching 90% coverage",
    ],
  },
  {
    company: "University IT Services",
    position: "Web Developer Intern",
    duration: "Sep 2022 - May 2023",
    description:
      "Maintained and improved internal tools used by faculty and students.",
    techStack: ["Python", "Django", "JavaScript", "HTML/CSS", "MySQL"],
    highlights: [
      "Rebuilt the course catalog search, reducing page load time by 60%",
      "Automated weekly report generation, saving 5 hours per week",
    ],
  },
];

export const VOLUNTEER_WORK: VolunteerWork[] = [
  {
    organization: "Code for Community",
    role: "Lead Developer",
    duration: "Mar 2024 - Present",
    description:
      "Volunteering as lead developer on a pro-bono web app that connects local food banks with surplus donors.",
  },
  {
    organization: "Hack4Good",
    role: "Mentor & Judge",
    duration: "Oct 2023 - Present",
    description:
      "Mentoring student teams during weekend hackathons focused on social impact projects.",
  },
  {
    organization: "Open Source Initiative",
    role: "Contributor",
    duration: "Jan 2023 - Aug 2023",
    description:
      "Contributed bug fixes and documentation improvements to popular open-source UI component libraries.",
  },
];

export const ACTIVITIES: Activity[] = [
  {
    title: "Open Source",
    description:
      "Active contributor to several open-source projects, focusing on developer tooling and UI libraries.",
    icon: "📦",
  },
  {
    title: "Tech Writing",
    description:
      "Occasionally publish blog posts about web performance, TypeScript patterns, and developer experience.",
    icon: "✍️",
  },
  {
    title: "Rock Climbing",
    description:
      "Bouldering enthusiast who enjoys the problem-solving nature of climbing routes.",
    icon: "🧗",
  },
  {
    title: "Photography",
    description:
      "Landscape and street photography hobbyist, always looking for interesting compositions.",
    icon: "📷",
  },
];
