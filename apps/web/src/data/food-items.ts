export interface FoodItemData {
  id: string;
  emoji: string;
  page: string;
  className: string;
}

export const FOOD_ITEMS: readonly FoodItemData[] = [
  // Homepage
  { id: "pizza-hero", emoji: "🍕", page: "/", className: "absolute top-[15%] right-[8%]" },
  { id: "sushi-about", emoji: "🍣", page: "/", className: "absolute bottom-[20%] left-[5%]" },
  { id: "taco-projects", emoji: "🌮", page: "/", className: "absolute top-[60%] right-[3%]" },
  // About page
  { id: "donut-skills", emoji: "🍩", page: "/about", className: "absolute top-[30%] right-[6%]" },
  { id: "cookie-edu", emoji: "🍪", page: "/about", className: "absolute top-[55%] left-[4%]" },
  { id: "ramen-certs", emoji: "🍜", page: "/about", className: "absolute bottom-[15%] right-[10%]" },
];
