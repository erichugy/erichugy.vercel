import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  return (
    <header className="bg-page border-b border-border/60">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4 md:py-5 lg:px-8 lg:py-6">
        <Link href="/" className="flex items-center justify-self-start">
          <Image
            src="/logo.png"
            alt="Eric Huang logo"
            width={112}
            height={112}
            className="size-20 rounded md:size-24 lg:size-28"
            priority
          />
        </Link>

        <ul className="hidden items-center gap-6 md:flex md:justify-self-center lg:gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-body transition-colors hover:text-heading lg:text-base"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/#contact"
          className="justify-self-end rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover md:px-6 md:py-2.5 md:text-base lg:px-7 lg:py-3"
        >
          Hire Me
        </Link>
      </nav>
    </header>
  );
}
