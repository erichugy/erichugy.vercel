export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  techStack: string[];
  highlights: string[];
}

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: "Acme Corp",
    position: "Full Stack Developer",
    duration: "Jan 2024 - Present",
    description:
      "Building and maintaining customer-facing web applications with a focus on performance and accessibility.",
    techStack: ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    highlights: [
      "Led migration from legacy CRA app to Next.js, improving LCP by 40%",
      "Designed and implemented a real-time notification system",
      "Mentored two junior developers through onboarding",
    ],
  },
  {
    company: "StartupXYZ",
    position: "Frontend Engineer",
    duration: "Jun 2022 - Dec 2023",
    description:
      "Developed the core product UI for an early-stage SaaS platform serving thousands of users.",
    techStack: ["React", "TypeScript", "GraphQL", "Styled Components"],
    highlights: [
      "Built a drag-and-drop dashboard builder from scratch",
      "Reduced bundle size by 35% through code splitting and lazy loading",
      "Introduced end-to-end testing with Playwright, achieving 90% coverage",
    ],
  },
  {
    company: "Freelance",
    position: "Web Developer",
    duration: "Jan 2021 - May 2022",
    description:
      "Delivered custom websites and web applications for small businesses and local clients.",
    techStack: ["HTML", "CSS", "JavaScript", "WordPress", "Node.js"],
    highlights: [
      "Completed 15+ client projects on time and within budget",
      "Built a custom e-commerce solution that increased client revenue by 25%",
      "Maintained long-term relationships with repeat clients",
    ],
  },
];
