"use client";

import type { ReactNode } from "react";

import type { GalleryEntry, GalleryVariant } from "@/data/ui-gallery";

/** Tailwind has no `.dark` variant configured, so scoping the class re-binds the tokens. */
const OUTLINE_CLASS = "[&_*]:outline [&_*]:outline-1 [&_*]:outline-dashed [&_*]:outline-accent/30";

function Frame({
  label,
  dark,
  width,
  outlined,
  children,
}: {
  label?: string;
  dark?: boolean;
  width: number | null;
  outlined: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {label ? (
        <span className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted">
          {label}
        </span>
      ) : null}
      <div
        className={`${dark ? "dark" : ""} overflow-x-auto rounded-lg border border-border`}
      >
        <div
          className={`bg-page p-6 ${outlined ? OUTLINE_CLASS : ""}`}
          style={width === null ? undefined : { width }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export interface GalleryStageProps {
  entry: GalleryEntry;
  variant: GalleryVariant;
  width: number | null;
  sideBySide: boolean;
  outlined: boolean;
}

export default function GalleryStage({
  entry,
  variant,
  width,
  sideBySide,
  outlined,
}: GalleryStageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
      <header className="mb-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="font-mono text-[15px] font-semibold text-heading">{entry.name}</h1>
          <span className="font-mono text-[12px] text-muted">/ {variant.name}</span>
        </div>
        <code className="font-mono text-[11px] text-muted">{entry.source}</code>
        {variant.description ? (
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-body">
            {variant.description}
          </p>
        ) : null}
      </header>

      {sideBySide ? (
        <div className="flex flex-col gap-4 lg:flex-row">
          <Frame label="Light" width={width} outlined={outlined}>
            {variant.render()}
          </Frame>
          <Frame label="Dark" dark width={width} outlined={outlined}>
            {variant.render()}
          </Frame>
        </div>
      ) : (
        <Frame width={width} outlined={outlined}>
          {variant.render()}
        </Frame>
      )}
    </div>
  );
}
