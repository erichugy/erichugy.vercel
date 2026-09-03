"use client";

import { useRef } from "react";

const BUTTON_CLASS =
  "rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-body transition-colors hover:border-accent hover:text-heading disabled:cursor-not-allowed disabled:opacity-50";

export interface ErdToolbarProps {
  tableCount: number;
  relationCount: number;
  hiddenRelationCount: number;
  onImportJson: (file: File) => void;
  onExportJson: () => void;
  onExportSql: () => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onRestoreHidden: () => void;
  onLoadSample: () => void;
  onClear: () => void;
}

export default function ErdToolbar({
  tableCount,
  relationCount,
  hiddenRelationCount,
  onImportJson,
  onExportJson,
  onExportSql,
  onAutoLayout,
  onFitView,
  onRestoreHidden,
  onLoadSample,
  onClear,
}: ErdToolbarProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-page-alt px-3 py-2">
      <span className="font-mono text-[11px] text-muted">
        {tableCount} table{tableCount === 1 ? "" : "s"} · {relationCount} relationship
        {relationCount === 1 ? "" : "s"}
      </span>

      <span className="mx-1 h-4 w-px bg-border" />

      <button type="button" className={BUTTON_CLASS} onClick={onAutoLayout} disabled={!tableCount}>
        Auto-layout
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={onFitView} disabled={!tableCount}>
        Fit view
      </button>

      {hiddenRelationCount ? (
        <button type="button" className={BUTTON_CLASS} onClick={onRestoreHidden}>
          Restore {hiddenRelationCount} deleted
        </button>
      ) : null}

      <span className="mx-1 h-4 w-px bg-border" />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            onImportJson(file);
          }

          event.target.value = "";
        }}
      />
      <button
        type="button"
        className={BUTTON_CLASS}
        onClick={() => importInputRef.current?.click()}
        title="Import a diagram exported from this tool"
      >
        Import JSON
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={onExportJson}>
        Export JSON
      </button>
      <button type="button" className={BUTTON_CLASS} onClick={onExportSql} disabled={!tableCount}>
        Export SQL
      </button>

      <span className="ml-auto flex items-center gap-2">
        <button type="button" className={BUTTON_CLASS} onClick={onLoadSample}>
          Sample
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={onClear}>
          Clear
        </button>
      </span>
    </div>
  );
}
