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
  techStack?: string[];
}

export interface Activity {
  title: string;
  description: string;
  icon: string;
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
      "Built an Odoo ERP integration, creating REST endpoints and exposing ERP entities as dynamic bot knowledge; supported $200K+ in enterprise pipeline",
      "Extended the Slack integration with cross-channel routing and state correlation, enabling multi-legged conversations with in-thread response reconciliation",
      "Built an ADK-based Slack bot that auto-logs ~10 integration requests/week, improving traceability and cutting support-channel noise",
      "Hardened the public Botpress ADK CLI (~400 weekly downloads) and refined agent-skill files for Claude Code/LLM workflows",
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
      "Automated 20+ accounting and order-to-cash workflows via custom NetSuite pages and Map/Reduce pipelines, processing 100 orders/min",
      "Integrated NetSuite with WMS/TMS platforms via REST APIs and data contracts, doubling fulfillment throughput",
      "Refactored inefficient JOIN operations and implemented query caching, reducing lookup latency by 65% (~800ms)",
      "Cut reporting time by 50% through automated custom NetSuite web pages",
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
      "Architected a distributed path-finding system using IMPALA and RLlib; proposed a hybrid A*/RL framework for global navigation with local collision avoidance",
      "Developed a 'Revolving Mini-Batch' training strategy that eliminated catastrophic forgetting and enabled generalization across distinct obstacle layouts",
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
      "Launched a pipeline to automate large dataset extraction, cleaning, and parsing, reducing data errors by 20% and cutting processing time by 75%",
      "Built an interactive KPI dashboard with Python and Power BI, automating nearly 50% of monthly financial operations",
    ],
  },
];

export const VOLUNTEER_WORK: VolunteerWork[] = [
  {
    organization: "Hack4Impact McGill — Welcome Collective",
    role: "Full Stack Developer",
    duration: "Sep 2024 - May 2025",
    description:
      "Engineered a logistics routing engine using A* to optimize donation pick-up/delivery schedules, enabling managers to coordinate routes for 100+ daily clients. Designed a PostgreSQL schema to manage real-time inventory and client data, improving item allocation accuracy by 40%.",
    techStack: ["TypeScript", "React", "Node.js", "Express", "Docker", "PostgreSQL"],
  },
  {
    organization: "123Loadboard — CodeJams Hackathon",
    role: "Developer",
    duration: "Oct 2023",
    description:
      "Designed a recommendation algorithm for truck drivers to optimize deliveries and maximize profit. Developed predictive models using Random Forest Regression to estimate upcoming deliveries.",
    techStack: ["Flutter", "Python", "MQTT", "Scikit-Learn", "Docker", "FastAPI"],
  },
];

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
