"use client";

import { useMemo, useState } from "react";

import type { GalleryEntry } from "@/data/ui-gallery";

export interface GallerySidebarProps {
  entries: readonly GalleryEntry[];
  activeEntryId: string;
  activeVariantId: string;
  onSelect: (entryId: string, variantId: string) => void;
}

export default function GallerySidebar({
  entries,
  activeEntryId,
  activeVariantId,
  onSelect,
}: GallerySidebarProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = needle
      ? entries.filter(
          (entry) =>
            entry.name.toLowerCase().includes(needle) ||
            entry.group.toLowerCase().includes(needle) ||
            entry.variants.some((variant) => variant.name.toLowerCase().includes(needle)),
        )
      : entries;

    const grouped = new Map<string, GalleryEntry[]>();

    for (const entry of matching) {
      const bucket = grouped.get(entry.group) ?? [];
      bucket.push(entry);
      grouped.set(entry.group, bucket);
    }

    return [...grouped.entries()];
  }, [entries, query]);

  const variantCount = entries.reduce((total, entry) => total + entry.variants.length, 0);

  return (
    <div className="flex h-full flex-col border-r border-border bg-page-alt">
      <div className="border-b border-border px-3 py-2">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
            Components
          </span>
          <span className="font-mono text-[10px] text-muted">
            {entries.length} · {variantCount} variants
          </span>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter…"
          className="w-full rounded border border-border bg-page px-2 py-1 font-mono text-[12px] text-heading outline-none focus:border-accent"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-1 py-2">
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-[11px] text-muted">No matches.</p>
        ) : null}

        {groups.map(([group, groupEntries]) => (
          <div key={group} className="mb-3">
            <span className="block px-3 pb-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              {group}
            </span>
            <ul>
              {groupEntries.map((entry) => (
                <li key={entry.id} className="mb-0.5">
                  <span className="block px-3 py-0.5 font-mono text-[12px] text-heading">
                    {entry.name}
                  </span>
                  <ul className="ml-3 border-l border-border pl-2">
                    {entry.variants.map((variant) => {
                      const isActive = entry.id === activeEntryId && variant.id === activeVariantId;

                      return (
                        <li key={variant.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(entry.id, variant.id)}
                            className={`w-full truncate rounded px-2 py-0.5 text-left font-mono text-[11px] transition-colors ${
                              isActive
                                ? "bg-accent/15 text-heading"
                                : "text-body hover:text-heading"
                            }`}
                          >
                            {variant.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
