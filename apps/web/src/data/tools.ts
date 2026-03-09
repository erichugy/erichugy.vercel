export interface Tool {
  title: string;
  description: string;
  href: string;
  techStack: string[];
  icon: string;
  gradient: string;
}

export const TOOLS: readonly Tool[] = [
  {
    title: "Request Bin",
    description:
      "A lightweight request inspection tool that captures incoming HTTP requests and displays them with syntax-highlighted headers, body, and query parameters. Send requests to your unique endpoint and watch them appear in real-time. Supports all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) with color-coded method badges.",
    href: "/requests",
    techStack: ["Next.js", "TypeScript", "Zod"],
    icon: "\uD83D\uDD0D",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    title: "Stock Sentiment Analyzer",
    description:
      "Enter any stock ticker to fetch the latest news articles via the Alpaca Markets API, run them through Cohere's NLP model to evaluate sentiment, and get a BUY, SELL, or HOLD recommendation with a confidence score.",
    href: "/projects/trading-bot",
    techStack: ["Python", "Flask", "Cohere", "Alpaca API"],
    icon: "\uD83D\uDCC8",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];
