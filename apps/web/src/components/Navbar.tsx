"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { NAV_LINKS } from "@/lib/constants";

import MobileNavigation from "./MobileNavigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="bg-page/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <nav className="mx-auto grid max-w-7xl items-center px-6 py-3 md:py-4 lg:px-8 lg:py-4 md:grid-cols-[1fr_auto_1fr] grid-cols-[1fr_1fr_1fr]">
          {/* Mobile: Left - Theme Toggle | Desktop: Logo */}
          <div className="md:hidden flex items-center justify-self-start">
            <ThemeToggle />
          </div>

          <Link href="/" className="hidden md:flex items-center justify-self-start">
            <Image
              src="/logo.png"
              alt="Eric Huang logo"
              width={1024}
              height={1024}
              className="size-24 rounded-xl md:size-[8rem] lg:size-[9rem]"
              priority
            />
          </Link>

          {/* Mobile: Center - Logo | Desktop: Center - Nav links */}
          <Link href="/" className="md:hidden flex items-center justify-self-center">
            <Image
              src="/logo.png"
              alt="Eric Huang logo"
              width={1024}
              height={1024}
              className="size-24 rounded-xl md:size-[8rem] lg:size-[9rem]"
              priority
            />
          </Link>

          <ul className="hidden md:flex items-center gap-6 justify-self-center lg:gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative text-base font-medium font-mono text-body transition-colors hover:text-accent lg:text-lg after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-accent after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile: Right - Hamburger | Desktop: Right - Theme Toggle */}
          <div className="flex items-center justify-self-end gap-4">
            {/* Desktop theme toggle - hidden on mobile */}
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-[10px] border border-border text-body hover:text-heading hover:border-accent/50 transition-all"
            >
              {isOpen ? (
                // X icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
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
              ) : (
                // Hamburger icon - proper SVG hamburger
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="3" y="5" width="18" height="2" rx="1" />
                  <rect x="3" y="11" width="18" height="2" rx="1" />
                  <rect x="3" y="17" width="18" height="2" rx="1" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>
      <MobileNavigation isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
