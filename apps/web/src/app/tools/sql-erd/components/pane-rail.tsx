"use client";

import { RAIL_WIDTH } from "../sql-erd.constants";

export interface PaneRailProps {
  label: string;
  /** Optional count shown under the label, e.g. how many files are hidden. */
  badge?: string;
  onExpand: () => void;
}

/** A collapsed pane, reduced to a vertical label the user can click to reopen. */
export default function PaneRail({ label, badge, onExpand }: PaneRailProps) {
  return (
    <div
      className="flex h-full flex-col items-center gap-2 border-r border-border bg-page-alt py-2"
      style={{ width: RAIL_WIDTH }}
    >
      <button
        type="button"
        onClick={onExpand}
        className="rounded px-1 font-mono text-[12px] leading-none text-muted transition-colors hover:bg-card hover:text-heading"
        title={`Show ${label.toLowerCase()}`}
        aria-label={`Show ${label.toLowerCase()}`}
      >
        »
      </button>

      <button
        type="button"
        onClick={onExpand}
        className="flex-1 font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-heading"
        style={{ writingMode: "vertical-rl" }}
      >
        {label}
      </button>

      {badge ? (
        <span className="font-mono text-[10px] text-muted" aria-hidden>
          {badge}
        </span>
      ) : null}
    </div>
  );
}
