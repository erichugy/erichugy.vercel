export interface Project {
  title: string;
  description: string;
  longDescription: string;
  image: string;
  techStack: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageBackgroundClassName: string;
  featured?: boolean;
}

export const PROJECTS: readonly Project[] = [
  {
    title: "Turing Poker Bot",
    description:
      "An autonomous Texas Hold'em poker bot built for the McGill Physics Hackathon.",
    longDescription:
      "Developed for the McGill Physics Hackathon/Tournament, this poker bot plays Texas Hold'em autonomously. The core logic involves real-time calculation of Expected Value (EV) by analyzing pot odds, estimating opponent hand ranges, and simulating win probabilities. To handle dynamic opponents, it uses an adaptive strategy with moving averages of opponent actions to model their aggression and looseness, shifting between conservative and aggressive playstyles based on table dynamics. Successfully competed against other student-made agents, qualifying for cash prizes in two separate rounds.",
    image: "/inspiration.png",
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
    featured: true,
  },
  {
    title: "Stock Sentiment Analyzer",
    description:
      "A hackathon project that fetches news and runs NLP sentiment analysis to generate stock recommendations.",
    longDescription:
      "Built at McHacks 10, this tool fetches the latest news articles via the Alpaca Markets API, runs them through Cohere's NLP model to evaluate sentiment, then generates a BUY, SELL, or HOLD recommendation with a confidence score. Features a live demo with real-time analysis.",
    image: "/inspiration.png",
    techStack: ["Python", "Flask", "Cohere", "Alpaca API", "BeautifulSoup"],
    primaryCtaLabel: "Try Live Demo",
    primaryCtaHref: "/projects/trading-bot",
    secondaryCtaLabel: "View Code",
    secondaryCtaHref: "https://github.com/erichugy/",
    imageBackgroundClassName:
      "bg-gradient-to-br from-violet-500/80 to-fuchsia-600/80",
  },
  {
    title: "Distributed RL Path-Finding",
    description:
      "Research on distributed deep reinforcement learning for path-finding in dynamic environments.",
    longDescription:
      "Architected a distributed path-finding system using IMPALA and RLlib, proposing a hybrid A*/RL framework for global navigation with local collision avoidance. Developed a 'Revolving Mini-Batch' training strategy that eliminated catastrophic forgetting and enabled generalization across distinct obstacle layouts. Conducted as research at McGill University.",
    image: "/inspiration.png",
    techStack: ["Python", "PyTorch", "RLlib", "IMPALA", "A3C"],
    primaryCtaLabel: "View Report",
    primaryCtaHref: "/Eric_Huang_Software-can.pdf",
    imageBackgroundClassName:
      "bg-gradient-to-br from-amber-500/80 to-orange-600/80",
  },
];
