import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS } from "@/lib/constants";

import ThemeToggle from "./ThemeToggle";
import MobileNavigation from "./MobileNavigation";

export default function Navbar() {
  return (
    <>
      <header className="bg-page/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-3 md:py-4 lg:px-8 lg:py-4">
          <Link href="/" className="flex items-center justify-self-start">
            <Image
              src="/logo.png"
              alt="Eric Huang logo"
              width={1024}
              height={1024}
              className="size-24 rounded-xl md:size-[8rem] lg:size-[9rem]"
              priority
            />
          </Link>

          <ul className="hidden items-center gap-6 md:flex md:justify-self-center lg:gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-base font-medium font-mono text-body transition-colors hover:text-heading lg:text-lg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="justify-self-end">
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <MobileNavigation />
    </>
  );
}
