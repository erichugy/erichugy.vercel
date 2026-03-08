export const TECH_STACK = [
  { name: "Python", description: "Core language" },
  { name: "Flask", description: "Web framework" },
  { name: "Cohere", description: "NLP model" },
  { name: "Alpaca API", description: "News data" },
  { name: "BeautifulSoup", description: "Web scraping" },
] as const;

export const RECOMMENDATION_STYLES: Record<string, string> = {
  BUY: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  SELL: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  HOLD: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
};
