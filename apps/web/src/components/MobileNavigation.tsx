"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { NAV_LINKS } from "@/lib/constants";

import ThemeToggle from "./ThemeToggle";

type MobileNavigationProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileNavigation({
  isOpen,
  onClose,
}: MobileNavigationProps) {
  const pathname = usePathname();

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto bg-black/30 opacity-100 dark:bg-black/50"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-y-0 right-0 z-50 flex w-[85%] flex-col gap-8 overflow-y-auto bg-white/80 p-8 backdrop-blur-md transition-all duration-300 dark:bg-slate-900/80 dark:border-slate-700/50 border border-white/20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute top-6 right-6 text-body hover:text-heading transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Navigation Links */}
        <nav className="mt-8">
          <ul className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`text-lg font-medium font-mono transition-colors ${
                      isActive
                        ? "text-accent"
                        : "text-body hover:text-heading"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="mt-auto pt-8 border-t border-border/20">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
