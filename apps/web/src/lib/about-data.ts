<<<<<<< HEAD
<<<<<<< HEAD
=======
// -- Types ------------------------------------------------------------------

>>>>>>> 8e5f050 (multi-agent(about-volunteer): Add volunteer work section component)
export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  techStack: string[];
  highlights: string[];
}

<<<<<<< HEAD
=======
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

// -- Data -------------------------------------------------------------------

>>>>>>> 8e5f050 (multi-agent(about-volunteer): Add volunteer work section component)
export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: "Acme Corp",
    position: "Full Stack Developer",
    duration: "Jan 2024 - Present",
    description:
<<<<<<< HEAD
      "Building and maintaining customer-facing web applications with a focus on performance and accessibility.",
=======
      "Building and maintaining customer-facing web applications serving thousands of daily users.",
>>>>>>> 8e5f050 (multi-agent(about-volunteer): Add volunteer work section component)
    techStack: ["React", "Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    highlights: [
      "Led migration from legacy CRA app to Next.js, improving LCP by 40%",
      "Designed and implemented a real-time notification system",
      "Mentored two junior developers through onboarding",
    ],
  },
  {
<<<<<<< HEAD
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
=======
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

=======
export interface Activity {
  title: string;
  description: string;
  icon: string; // emoji
}

>>>>>>> 1162deb (multi-agent(about-activities): Add activities and interests section component)
export const ACTIVITIES: Activity[] = [
  {
    title: "Open Source",
    description:
<<<<<<< HEAD
      "Active contributor to several open-source projects, focusing on developer tooling and UI libraries.",
    icon: "\u{1F4E6}",
=======
      "Active contributor to several open-source projects, focusing on developer tools and web frameworks.",
    icon: "📦",
>>>>>>> 1162deb (multi-agent(about-activities): Add activities and interests section component)
  },
  {
    title: "Tech Writing",
    description:
<<<<<<< HEAD
      "Occasionally publish blog posts about web performance, TypeScript patterns, and developer experience.",
    icon: "\u{270D}\u{FE0F}",
=======
      "Occasionally publish blog posts about web performance, architecture patterns, and lessons learned.",
    icon: "✍️",
>>>>>>> 1162deb (multi-agent(about-activities): Add activities and interests section component)
  },
  {
    title: "Rock Climbing",
    description:
<<<<<<< HEAD
      "Bouldering enthusiast who enjoys the problem-solving nature of climbing routes.",
    icon: "\u{1F9D7}",
=======
      "Bouldering enthusiast who enjoys the problem-solving nature of figuring out routes.",
    icon: "🧗",
>>>>>>> 1162deb (multi-agent(about-activities): Add activities and interests section component)
  },
  {
    title: "Photography",
    description:
<<<<<<< HEAD
      "Landscape and street photography hobbyist, always looking for interesting compositions.",
    icon: "\u{1F4F7}",
  },
];
>>>>>>> 8e5f050 (multi-agent(about-volunteer): Add volunteer work section component)
=======
      "Landscape and street photography hobbyist, always looking for interesting light and compositions.",
    icon: "📷",
  },
];
>>>>>>> 1162deb (multi-agent(about-activities): Add activities and interests section component)
