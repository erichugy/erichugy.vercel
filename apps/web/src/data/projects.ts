export interface Project {
  title: string;
  description: string;
  longDescription: string;
  image: string;
  techStack: readonly string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageBackgroundClassName: string;
  emoji?: string;
  featured?: boolean;
}

export const PROJECTS: readonly Project[] = [
  {
    title: "Turing Poker Bot",
    description:
      "An autonomous Texas Hold'em poker bot built for the McGill Physics Hackathon.",
    longDescription:
      "Developed for the McGill Physics Hackathon/Tournament, this poker bot plays Texas Hold'em autonomously. The core logic analyzes pot odds, estimates opponent hand ranges, and simulates win probabilities in real time. It adapts to table dynamics by modeling opponent behavior and shifting between conservative and aggressive playstyles, qualifying for cash prizes in two separate rounds.",
    image: "/turing-poker-bot-thumbnail.png",
    techStack: [
      "Python",
      "Probability Theory",
      "Game Theory",
      "Monte Carlo Simulation",
    ],
    primaryCtaLabel: "View on GitHub",
    primaryCtaHref: "https://github.com/denis-tsariov/python-poker-bot",
    imageBackgroundClassName:
      "bg-gradient-to-br from-emerald-500/80 to-cyan-600/80",
    emoji: "🃏",
    featured: true,
  },
  {
    title: "Stock Sentiment Analyzer",
    description:
      "A hackathon project that fetches news and runs NLP sentiment analysis to generate stock recommendations.",
    longDescription:
      "Built at McHacks 10, this tool fetches the latest news articles via the Alpaca Markets API, runs them through Cohere's NLP model to evaluate sentiment, then generates a BUY, SELL, or HOLD recommendation with a confidence score. It includes a live demo backed by real-time analysis.",
    image: "/trading-bot.png",
    techStack: ["Python", "Flask", "Cohere", "Alpaca API", "BeautifulSoup"],
    primaryCtaLabel: "Try Live Demo",
    primaryCtaHref: "/projects/trading-bot",
    secondaryCtaLabel: "View Code",
    secondaryCtaHref: "https://github.com/eli0009/McHacks10-trading-bot",
    imageBackgroundClassName:
      "bg-gradient-to-br from-violet-500/80 to-fuchsia-600/80",
    emoji: "📈",
  },
  {
    title: "CC9 — Gesture Censorship",
    description:
      "AI vision pipeline that detects and censors derogatory hand signs in videos in real time.",
    longDescription:
      "Built with the CodeCloud9 team, CC9 leverages MediaPipe and a custom-trained classifier to detect derogatory hand gestures frame-by-frame, then applies adaptive blurring or replacement censorship to the offending regions. The pipeline runs end-to-end on uploaded videos and exports a clean, family-friendly output.",
    image: "/cc9-censorship.png",
    techStack: ["Python", "MediaPipe", "OpenCV", "TensorFlow", "Computer Vision"],
    primaryCtaLabel: "Watch Demo",
    primaryCtaHref:
      "https://www.youtube.com/watch?v=8joYMFchrZo&ab_channel=AdamSimard",
    secondaryCtaLabel: "View Code",
    secondaryCtaHref: "https://github.com/Simard302/cc9-gesture-censorship",
    imageBackgroundClassName:
      "bg-gradient-to-br from-rose-500/80 to-orange-500/80",
    emoji: "🛡️",
  },
  {
    title: "Stroke Predictor",
    description:
      "Deep-learning model that predicts stroke likelihood — placed 7th at the 2022 PolyAI Hackathon.",
    longDescription:
      "Trained for the 2022 PolyAI Hackathon, this TensorFlow classifier predicts stroke likelihood from health and lifestyle features. Engineered the data-cleaning and feature-engineering pipeline, tuned the network architecture, and shipped an end-to-end inference notebook — placing 7th in our category.",
    image: "/stroke-predictor.png",
    techStack: ["Python", "TensorFlow", "Pandas", "Scikit-Learn", "Jupyter"],
    primaryCtaLabel: "View on GitHub",
    primaryCtaHref: "https://github.com/eli0009/CodeML_project",
    imageBackgroundClassName:
      "bg-gradient-to-br from-sky-500/80 to-indigo-600/80",
    emoji: "🧬",
  },
  {
    title: "Distributed RL Path-Finding",
    description:
      "Research on distributed deep reinforcement learning for path-finding in dynamic environments.",
    longDescription:
      "Architected a distributed path-finding system using IMPALA and RLlib, proposing a hybrid A*/RL framework for global navigation with local collision avoidance. A revolving mini-batch training strategy eliminated catastrophic forgetting and improved generalization across distinct obstacle layouts during research at McGill University.",
    image: "",
    techStack: ["Python", "PyTorch", "RLlib", "IMPALA", "A3C"],
    primaryCtaLabel: "View Report",
    primaryCtaHref: "/Eric_Huang_Software-can.pdf",
    imageBackgroundClassName:
      "bg-gradient-to-br from-amber-500/80 to-orange-600/80",
    emoji: "🧠",
  },
  {
    title: "Automatic Email Sender",
    description:
      "Personal automation that mail-merges Word documents and bulk-sends them to a contact list.",
    longDescription:
      "A small but heavily used personal tool: it merges templated Word documents with a contact spreadsheet and dispatches personalized emails through SMTP. Built to streamline outreach for newsletters and event announcements, it shaves hours off manual mail merge workflows.",
    image: "/email-sender.png",
    techStack: ["Python", "SMTP", "python-docx", "openpyxl"],
    primaryCtaLabel: "View on GitHub",
    primaryCtaHref: "https://github.com/erichugy/Email-Sender",
    imageBackgroundClassName:
      "bg-gradient-to-br from-teal-500/80 to-emerald-600/80",
    emoji: "✉️",
  },
];
