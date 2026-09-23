"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { UI_GALLERY } from "@/data/ui-gallery";

import GallerySidebar from "./components/gallery-sidebar";
import GalleryStage from "./components/gallery-stage";
import GalleryToolbar from "./components/gallery-toolbar";
import {
  DEFAULT_VIEWPORT_ID,
  ENTRY_PARAM,
  VARIANT_PARAM,
  VIEWPORT_PRESETS,
} from "./ui-gallery.constants";

export default function UiGalleryClient() {
  const [entryId, setEntryId] = useState(UI_GALLERY[0].id);
  const [variantId, setVariantId] = useState(UI_GALLERY[0].variants[0].id);
  const [viewportId, setViewportId] = useState(DEFAULT_VIEWPORT_ID);
  const [sideBySide, setSideBySide] = useState(false);
  const [outlined, setOutlined] = useState(false);

  // Read the deep link after mount rather than through useSearchParams, which would
  // force this statically rendered route behind a Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedEntry = UI_GALLERY.find((entry) => entry.id === params.get(ENTRY_PARAM));

    if (!requestedEntry) {
      return;
    }

    const requestedVariant = requestedEntry.variants.find(
      (variant) => variant.id === params.get(VARIANT_PARAM),
    );

    startTransition(() => {
      setEntryId(requestedEntry.id);
      setVariantId((requestedVariant ?? requestedEntry.variants[0]).id);
    });
  }, []);

  const handleSelect = useCallback((nextEntryId: string, nextVariantId: string) => {
    setEntryId(nextEntryId);
    setVariantId(nextVariantId);

    const params = new URLSearchParams(window.location.search);
    params.set(ENTRY_PARAM, nextEntryId);
    params.set(VARIANT_PARAM, nextVariantId);
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);
  }, []);

  const entry = useMemo(
    () => UI_GALLERY.find((candidate) => candidate.id === entryId) ?? UI_GALLERY[0],
    [entryId],
  );
  const variant = useMemo(
    () => entry.variants.find((candidate) => candidate.id === variantId) ?? entry.variants[0],
    [entry, variantId],
  );
  const width = useMemo(
    () => VIEWPORT_PRESETS.find((preset) => preset.id === viewportId)?.width ?? null,
    [viewportId],
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-page text-body">
      <header className="flex items-center gap-3 border-b border-border bg-page px-4 py-2">
        <Link
          href="/"
          className="font-mono text-[12px] text-muted transition-colors hover:text-heading"
        >
          ← Site
        </Link>
        <h1 className="font-mono text-[13px] font-semibold text-heading">UI gallery</h1>
        <p className="hidden truncate font-mono text-[11px] text-muted md:block">
          Every component rendered in the real theme · deep-linkable via the URL
        </p>
      </header>

      <GalleryToolbar
        viewportId={viewportId}
        sideBySide={sideBySide}
        outlined={outlined}
        onViewportChange={setViewportId}
        onSideBySideChange={setSideBySide}
        onOutlinedChange={setOutlined}
      />

      <div className="flex min-h-0 flex-1">
        <div className="w-60 shrink-0">
          <GallerySidebar
            entries={UI_GALLERY}
            activeEntryId={entry.id}
            activeVariantId={variant.id}
            onSelect={handleSelect}
          />
        </div>

        <GalleryStage
          entry={entry}
          variant={variant}
          width={width}
          sideBySide={sideBySide}
          outlined={outlined}
        />
      </div>
    </div>
  );
}
