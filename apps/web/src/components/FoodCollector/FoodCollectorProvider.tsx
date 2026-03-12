"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { SHOW_FOOD_COLLECTOR } from "@/config/feature-flags";
import { FOOD_ITEMS } from "@/data/food-items";

import CelebrationModal from "./CelebrationModal";

interface FoodCollectorContextValue {
  collected: Set<string>;
  total: number;
  collect: (id: string) => void;
  allCollected: boolean;
  reset: () => void;
}

const FoodCollectorContext = createContext<FoodCollectorContextValue | null>(null);

const STORAGE_KEY = "food-collector-collected";

export function useFoodCollector() {
  const ctx = useContext(FoodCollectorContext);
  if (!ctx) {
    throw new Error("useFoodCollector must be used within FoodCollectorProvider");
  }
  return ctx;
}

export default function FoodCollectorProvider({ children }: { children: React.ReactNode }) {
  if (!SHOW_FOOD_COLLECTOR) {
    return <>{children}</>;
  }

  return <FoodCollectorInner>{children}</FoodCollectorInner>;
}

function FoodCollectorInner({ children }: { children: React.ReactNode }) {
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const total = FOOD_ITEMS.length;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setCollected(new Set(ids));
      }
    } catch {
      // localStorage unavailable or corrupted — start fresh
    }
  }, []);

  const collect = useCallback(
    (id: string) => {
      setCollected((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // localStorage full — still track in memory
        }
        if (next.size === total) {
          setShowModal(true);
        }
        return next;
      });
    },
    [total],
  );

  const reset = useCallback(() => {
    setCollected(new Set());
    setShowModal(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const allCollected = collected.size === total;

  return (
    <FoodCollectorContext.Provider value={{ collected, total, collect, allCollected, reset }}>
      {children}
      {showModal && <CelebrationModal onClose={() => setShowModal(false)} onReset={reset} />}
    </FoodCollectorContext.Provider>
  );
}
