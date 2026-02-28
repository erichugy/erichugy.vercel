import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="bg-page/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-3 md:py-4 lg:px-8 lg:py-4">
        <Link href="/" className="flex items-center justify-self-start">
          <Image
            src="/logo.png"
            alt="Eric Huang logo"
            width={112}
            height={112}
            className="size-16 rounded-xl md:size-20 lg:size-24"
            priority
          />
        </Link>

        <ul className="hidden items-center gap-6 md:flex md:justify-self-center lg:gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium font-mono text-body transition-colors hover:text-heading lg:text-[0.938rem]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 justify-self-end">
          <ThemeToggle />
          <Link
            href="/#contact"
            className="rounded-[10px] bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-md md:px-5 md:py-2 md:text-sm lg:px-6 lg:py-2.5"
          >
            Hire Me
          </Link>
        </div>
      </nav>
    </header>
  );
}
