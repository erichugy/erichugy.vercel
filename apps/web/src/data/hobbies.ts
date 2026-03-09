export interface Hobby {
  title: string;
  description: string;
  icon: string;
  details: string[];
  gradient: string;
}

export const HOBBIES: readonly Hobby[] = [
  {
    title: "Rock Climbing",
    description:
      "Bouldering enthusiast who enjoys the problem-solving nature of climbing routes.",
    icon: "🧗",
    details: [
      "V5-V6 bouldering level",
      "Regular at local climbing gyms",
      "Love the mental puzzle of reading routes",
    ],
    gradient: "from-orange-500/20 to-amber-500/20",
  },
  {
    title: "Photography",
    description:
      "Landscape and street photography hobbyist, always looking for interesting compositions.",
    icon: "📷",
    details: [
      "Landscape and street photography",
      "Captured scenes across Singapore and Montreal",
      "Focused on composition and natural light",
    ],
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Open Source & Dev Tooling",
    description:
      "Contributing to developer tools and building open-source projects.",
    icon: "🔧",
    details: [
      "Contributing to the Botpress ADK CLI",
      "Building AI agent workflow tools",
      "Passionate about developer experience",
    ],
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    title: "AI & Machine Learning",
    description:
      "Exploring reinforcement learning, distributed training, and applied AI for real-world problems.",
    icon: "🤖",
    details: [
      "Reinforcement learning research at McGill",
      "Distributed training with IMPALA/RLlib",
      "Applied NLP and sentiment analysis",
    ],
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];
