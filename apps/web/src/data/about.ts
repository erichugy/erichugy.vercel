import type {
  Activity,
  Certification,
  EducationEntry,
  Language,
  WorkExperience,
} from "@/types/about";

export type {
  Activity,
  Certification,
  EducationEntry,
  Language,
  ProjectEntry,
  VolunteerEntry,
  WorkExperience,
} from "@/types/about";

export const WORK_EXPERIENCES: WorkExperience[] = [
  {
    company: "Botpress",
    position: "Software Developer Intern",
    duration: "Jan 2026 - Present",
    description:
      "Building integrations and developer tooling for the Botpress conversational AI platform.",
    techStack: ["TypeScript", "Node.js", "Bun", "Zod", "Slack API"],
    highlights: [
      "Accelerated a $200K+ enterprise pipeline by engineering open-source integrations for Odoo and Slack, leveraging Claude Code to automate test generation and PR drafts.",
      "Reduced MTTR to <10 minutes (24/7) by architecting a real-time monitoring service using TypeScript and Bun; integrated Sentry and AWS Lambda to automate instant stakeholder alerting.",
      "Optimized the Botpress Studio export engine to support bots with 5GB+ RAG knowledge bases by parallelizing asset retrieval, eliminating system timeouts and introducing granular UI controls for selective data export.",
      "Enhanced enterprise bot accuracy by developing an automated evaluation framework utilizing LLM-as-a-judge to benchmark performance against custom Gold Datasets.",
      "Improved Developer Experience (DX) for ~400 weekly active users by hardening the Botpress ADK CLI and optimizing agent-skill definitions for Claude Code agentic workflows.",
      "Deployed and managed production AI bots for enterprise clients, ensuring system stability under high-concurrency loads of 300+ conversations per minute (~10/sec) through optimized hook execution and asynchronous API orchestration.",
    ],
  },
  {
    company: "LIDD Consultants",
    position: "Forward Deployed Developer",
    duration: "May 2023 - Dec 2025",
    description:
      "Built custom ERP solutions and automated enterprise workflows for supply chain and logistics clients.",
    techStack: ["JavaScript", "HTML/CSS", "NetSuite", "REST APIs", "SQL"],
    highlights: [
      "Captured $500K+ in service revenue across 10+ enterprise accounts by leading technical requirements gathering and solution architecting as the primary bridge between engineering and business stakeholders.",
      "Delivered a custom order-entry application for high-volume retailers, enabling parallel workflows for 5+ concurrent reps and supporting real-time inventory for ~10,000 items.",
      "Optimized client financial operations by reducing reporting time by 50%, automating 20+ accounting and Order-to-Cash workflows via custom NetSuite pages and Map/Reduce pipelines.",
      "Architected mission-critical WMS/TMS integrations via REST APIs, scaling client system throughput to 100 orders/min and automating end-to-end logistics fulfillment.",
      "Improved system responsiveness by 65% (~800ms) for enterprise users by refactoring inefficient database JOIN operations and implementing custom query caching strategies.",
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
      "Achieved agent convergence in <15 iterations by architecting a distributed path-finding system (IMPALA/RLlib) that utilized a hybrid A*/RL framework for global navigation and local collision avoidance.",
      "Eliminated catastrophic forgetting across diverse obstacle layouts by developing a 'Revolving Mini-Batch' training strategy, enabling a single robust policy to generalize across distinct environment states.",
      "Reduced computational overhead during training by implementing asynchronous gradient updates and V-trace off-policy correction to stabilize multi-agent learning on dynamic 10x10 grids.",
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
    awards: ["Recipient of McGill Entrance Scholarship (academic excellence)"],
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
    projects: [
      {
        role: "Full Stack Developer",
        organization: "Hack4Impact McGill — Welcome Collective",
        duration: "Sep 2024 - May 2025",
        description:
          "Optimized delivery schedules for 100+ daily clients by engineering a logistics routing engine using A* to minimize total travel distance and fuel consumption. Improved item allocation accuracy by 40% by architecting a PostgreSQL inventory schema and Dockerized Node.js backend to replace manual workflows.",
      },
      {
        role: "Independent Project",
        organization: "Turing Poker Bot",
        duration: "Feb 2025",
        description:
          "Secured cash prizes in competitive play by developing a real-time decision engine utilizing expectation calculations and opponent modeling. Maintained positive Expected Value (EV) in dynamic environments by integrating a moving average RL strategy to adapt to evolving opponent behaviors.",
      },
    ],
    volunteer: [
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
    name: "Valuation 1: DCF Training",
    issuer: "The Marquee Group",
    date: "Oct 2021",
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
  backend: ["Node.js", "Bun", "npm", "Zod", "Express", "FastAPI", "Flask"],
  frontend: ["React", "Next.js", "Tailwind CSS"],
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
