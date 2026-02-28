import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-page border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={1024}
              height={1024}
              className="size-10 rounded-lg"
            />
          </Link>

          {/* Navigation Links */}
          <nav>
            <ul className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-muted hover:text-heading transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                className="text-muted hover:text-accent transition-colors"
              >
                {/* Placeholder for social icons - using text for now */}
                <span className="text-lg font-semibold">
                  {social.icon === "in" ? "in" : "\uD835\uDD4F"}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-5 border-t border-border/40">
          <p className="font-mono text-muted text-xs">
            &copy; 2024 Eric Huang. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
