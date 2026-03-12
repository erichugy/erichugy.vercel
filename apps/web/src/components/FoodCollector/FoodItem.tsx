"use client";

import { useCallback, useState } from "react";

import { SHOW_FOOD_COLLECTOR } from "@/config/feature-flags";

import { useFoodCollector } from "./FoodCollectorProvider";

interface FoodItemProps {
  id: string;
  emoji: string;
  className?: string;
}

export default function FoodItem({ id, emoji, className = "" }: FoodItemProps) {
  if (!SHOW_FOOD_COLLECTOR) return null;

  return <FoodItemInner id={id} emoji={emoji} className={className} />;
}

function FoodItemInner({ id, emoji, className }: FoodItemProps) {
  const { collected, collect } = useFoodCollector();
  const [popping, setPopping] = useState(false);

  const handleClick = useCallback(() => {
    setPopping(true);
    // Let the pop animation finish before marking collected
    setTimeout(() => collect(id), 350);
  }, [collect, id]);

  if (collected.has(id)) return null;

  return (
    <button
      onClick={handleClick}
      aria-label={`Collect ${emoji} food item`}
      className={`
        ${className}
        z-10 cursor-pointer select-none border-0 bg-transparent p-0
        text-xl opacity-60 transition-all duration-200
        hover:scale-125 hover:opacity-100
        ${popping ? "animate-[food-pop_350ms_ease-out_forwards]" : "animate-[food-bob_3s_ease-in-out_infinite]"}
      `}
      style={{ lineHeight: 1 }}
    >
      {emoji}
    </button>
  );
}
