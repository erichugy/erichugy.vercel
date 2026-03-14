"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link>;

/**
 * Handles the Next.js App Router limitation where <Link> doesn't trigger
 * scroll for same-page hash navigation. Uses native <a> only when already
 * on the target page (so the browser handles anchor scrolling), and <Link>
 * for cross-page navigation (preserving client-side routing).
 */
export default function NavLink({ href, ...props }: NavLinkProps) {
  const pathname = usePathname();

  if (typeof href === "string" && href.includes("#")) {
    const hashIndex = href.indexOf("#");
    const hrefPath = href.slice(0, hashIndex) || "/";
    const hash = href.slice(hashIndex);

    // Same page — use native anchor so the browser scrolls to the hash
    if (pathname === hrefPath) {
      return <a href={hash} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} />;
    }

    // Different page — use Link for client-side navigation
    return <Link href={href} {...props} />;
  }

  return <Link href={href} {...props} />;
}
