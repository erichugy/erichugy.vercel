"use client";

import ThemeToggle from "@/components/navbar/ThemeToggle";

import { VIEWPORT_PRESETS } from "../ui-gallery.constants";

const BUTTON_CLASS =
  "rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors hover:border-accent hover:text-heading";

export interface GalleryToolbarProps {
  viewportId: string;
  sideBySide: boolean;
  outlined: boolean;
  onViewportChange: (viewportId: string) => void;
  onSideBySideChange: (sideBySide: boolean) => void;
  onOutlinedChange: (outlined: boolean) => void;
}

export default function GalleryToolbar({
  viewportId,
  sideBySide,
  outlined,
  onViewportChange,
  onSideBySideChange,
  onOutlinedChange,
}: GalleryToolbarProps) {
  const toggleClass = (active: boolean) =>
    `${BUTTON_CLASS} ${
      active ? "border-accent bg-accent/10 text-heading" : "border-border bg-card text-body"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-page-alt px-3 py-2">
      <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Width</span>
      {VIEWPORT_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onViewportChange(preset.id)}
          className={toggleClass(preset.id === viewportId)}
        >
          {preset.label}
        </button>
      ))}

      <span className="mx-1 h-4 w-px bg-border" />

      <button
        type="button"
        onClick={() => onSideBySideChange(!sideBySide)}
        className={toggleClass(sideBySide)}
        title="Render the variant twice, once with the dark tokens applied"
      >
        Light + dark
      </button>
      <button
        type="button"
        onClick={() => onOutlinedChange(!outlined)}
        className={toggleClass(outlined)}
        title="Outline every element to spot spacing and overflow"
      >
        Outline
      </button>

      <span className="ml-auto flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">Page theme</span>
        <ThemeToggle />
      </span>
    </div>
  );
}
