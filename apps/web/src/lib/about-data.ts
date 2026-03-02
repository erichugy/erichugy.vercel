// ── Feature Flags ──────────────────────────────────────────────────────────

/** Toggle to show/hide dates in the education timeline (work experience dates are always visible) */
export const SHOW_DATES = false;

// ── Types ──────────────────────────────────────────────────────────────────

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
  techStack: string[];
  highlights: string[];
}

export interface VolunteerEntry {
  role: string;
  organization: string;
  duration: string;
  description: string;
}

export interface EducationEntry {
  school: string;
  degree: string;
  duration: string;
  gpa?: string;
  awards?: string[];
  coursework?: string[];
  clubs?: string[];
  volunteer?: VolunteerEntry[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface Activity {
  title: string;
  description: string;
  icon: string;
}

export interface Language {
  name: string;
  level: string;
  details: string;
}

// ── Data ───────────────────────────────────────────────────────────────────

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: "Botpress",
    position: "Software Developer Intern",
    duration: "Jan 2026 - Present",
    description:
      "Building integrations and developer tooling for the Botpress conversational AI platform.",
    techStack: ["TypeScript", "Node.js", "Bun", "Zod", "Slack API"],
    highlights: [
      "Built an Odoo ERP integration, creating REST endpoints and exposing ERP entities as dynamic bot knowledge; supported $200K+ in enterprise pipeline.",
      "Extended the Slack integration with cross-channel routing and state correlation, enabling multi-legged conversations with in-thread response reconciliation.",
      "Built an ADK-based Slack bot that auto-logs ~10 integration requests/week, improving traceability and cutting support-channel noise.",
      "Hardened the public Botpress ADK CLI (~400 weekly downloads) and refined agent-skill files for Claude Code/LLM workflows.",
    ],
  },
  {
    company: "LIDD Consultants",
    position: "Software Developer",
    duration: "May 2023 - Dec 2025",
    description:
      "Built custom ERP solutions and automated enterprise workflows for supply chain and logistics clients.",
    techStack: ["JavaScript", "HTML/CSS", "NetSuite", "REST APIs", "SQL"],
    highlights: [
      "Automated 20+ accounting and order-to-cash workflows via custom NetSuite pages and Map/Reduce pipelines, processing 100 orders/min.",
      "Integrated NetSuite with WMS/TMS platforms via REST APIs and data contracts, doubling fulfillment throughput.",
      "Refactored inefficient JOIN operations and implemented query caching, reducing lookup latency by 65% (~800ms).",
      "Cut reporting time by 50% through automated custom NetSuite web pages.",
    ],
  },
  {
    company: "McGill University",
    position: "Researcher",
    duration: "Sep 2024 - Dec 2024",
    description:
      "Researched distributed deep reinforcement learning for path-finding in dynamic environments.",
    techStack: ["Python", "PyTorch", "RLlib", "IMPALA", "A3C"],
    highlights: [
      "Architected a distributed path-finding system using IMPALA and RLlib; proposed a hybrid A*/RL framework for global navigation with local collision avoidance.",
      "Developed a 'Revolving Mini-Batch' training strategy that eliminated catastrophic forgetting and enabled generalization across distinct obstacle layouts.",
    ],
  },
  {
    company: "Pratt & Whitney Canada",
    position: "Data Science Intern",
    duration: "Sep 2022 - Dec 2022",
    description:
      "Automated data pipelines and built interactive dashboards for aerospace manufacturing analytics.",
    techStack: ["Python", "Pandas", "Power BI", "SQL", "Regex"],
    highlights: [
      "Launched a pipeline to automate large dataset extraction, cleaning, and parsing, reducing data errors by 20% and cutting processing time by 75%.",
      "Built an interactive KPI dashboard with Python and Power BI, automating nearly 50% of monthly financial operations.",
    ],
  },
];

export const EDUCATION_ENTRIES: EducationEntry[] = [
  {
    school: "McGill University",
    degree: "Bachelor of Science in Computer Science, Minor in Management",
    duration: "Sep 2021 - May 2025",
    gpa: "3.85 / 4.00",
    awards: [
      "Recipient of McGill Entrance Scholarship (academic excellence)",
    ],
    coursework: [
      "Algorithms & Data Structures",
      "Operating Systems",
      "Database Systems",
      "Applied Machine Learning",
      "Information Retrieval",
      "Software Systems",
      "Discrete Mathematics",
      "Probability & Statistics",
    ],
    clubs: ["Hack4Impact", "GDSC", "BOLT Bootcamps", "MBIA", "MIC"],
    volunteer: [
      {
        role: "Full Stack Developer",
        organization: "Hack4Impact McGill — Welcome Collective",
        duration: "Sep 2024 - May 2025",
        description:
          "Engineered a logistics routing engine using A* to optimize donation pick-up/delivery schedules for 100+ daily clients. Designed a PostgreSQL schema improving item allocation accuracy by 40%.",
      },
      {
        role: "VP External",
        organization: "Google Developer Student Clubs (GDSC) McGill",
        duration: "Aug 2023 - May 2024",
        description:
          "Made Google technologies accessible to students via workshops. Connected students to professionals via networking sessions.",
      },
      {
        role: "Director of Technology",
        organization: "BOLT Bootcamps",
        duration: "Sep 2021 - May 2024",
        description:
          "Increased competing teams by over 250% through cross-university outreach. Led 5 brainstorming/networking sessions connecting students with industry professionals.",
      },
      {
        role: "Junior Analyst",
        organization: "McGill Investment Club (MIC)",
        duration: "Sep 2021 - May 2022",
        description:
          "Health Care team. Participated in 7 seminars on thesis development and financial valuation. Won a MIC stock pitch competition.",
      },
      {
        role: "Mentee",
        organization: "McGill Bankers International Association (MBIA)",
        duration: "Sep 2021 - May 2022",
        description:
          "Connected with alumni in investment banking positions worldwide to develop a comprehensive understanding of the industry.",
      },
    ],
  },
  {
    school: "National University of Singapore",
    degree: "Exchange Semester — Computer Science",
    duration: "Jan 2024 - May 2024",
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    name: "NetSuite Certified SuiteFoundation",
    issuer: "NetSuite",
    date: "Aug 2024",
    credentialId: "36226",
  },
  {
    name: "Pandas",
    issuer: "Kaggle",
    date: "Oct 2023",
  },
  {
    name: "Intro to Machine Learning",
    issuer: "Kaggle",
    date: "Oct 2023",
  },
  {
    name: "Valuation 1: DCF Training",
    issuer: "The Marquee Group",
    date: "Oct 2021",
  },
];

export const LANGUAGES: Language[] = [
  {
    name: "English",
    level: "Native",
    details: "Full professional proficiency",
  },
  {
    name: "French",
    level: "Advanced",
    details: "Reading, writing, and speaking",
  },
];

export const TECHNICAL_SKILLS = {
  languages: ["TypeScript", "JavaScript", "Python", "Bash", "HTML/CSS"],
  backend: ["Node.js", "Bun", "Zod", "Express", "FastAPI", "Flask"],
  frontend: ["React", "React Native", "Next.js", "Tailwind CSS"],
  dataML: ["Pandas", "Matplotlib", "Scikit-Learn", "PyTorch"],
  devOps: [
    "Docker",
    "Azure DevOps",
    "Git",
    "GitHub",
    "GitLab",
    "Jira",
    "Unix/Linux",
    "PostgreSQL",
  ],
};

export const ACTIVITIES: Activity[] = [
  {
    title: "Open Source & Dev Tooling",
    description:
      "Contributing to the Botpress ADK CLI and building developer tools for AI agent workflows.",
    icon: "📦",
  },
  {
    title: "AI & Machine Learning",
    description:
      "Exploring reinforcement learning, distributed training, and applied AI for real-world problems.",
    icon: "🤖",
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
