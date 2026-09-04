"use client";

import { useRef, useState } from "react";

import type { ParsedTable, SqlFile } from "@/tools/sql-erd";

import { SQL_FILE_EXTENSIONS } from "../sql-erd.constants";
import type { ErdSelection } from "../sql-erd.types";

export interface ErdFileExplorerProps {
  files: SqlFile[];
  accentByFileId: Record<string, string>;
  tablesByFileId: Record<string, ParsedTable[]>;
  activeFileId: string | null;
  selection: ErdSelection;
  onSelectFile: (fileId: string) => void;
  onAddFile: () => void;
  onUploadFiles: (files: FileList | null) => void;
  onToggleFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onRenameFile: (fileId: string, name: string) => void;
  onSelectTable: (tableId: string) => void;
  onCollapse: () => void;
}

export default function ErdFileExplorer({
  files,
  accentByFileId,
  tablesByFileId,
  activeFileId,
  selection,
  onSelectFile,
  onAddFile,
  onUploadFiles,
  onToggleFile,
  onRemoveFile,
  onRenameFile,
  onSelectTable,
  onCollapse,
}: ErdFileExplorerProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const commitRename = () => {
    if (renamingFileId) {
      onRenameFile(renamingFileId, draftName);
    }

    setRenamingFileId(null);
  };

  return (
    <div
      className={`flex h-full flex-col border-r bg-page-alt ${
        isDragOver ? "border-accent bg-accent/5" : "border-border"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        onUploadFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex items-center justify-between gap-1 border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted">Files</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onAddFile}
            className="rounded px-1.5 py-0.5 text-[11px] text-body transition-colors hover:bg-card hover:text-heading"
            title="New empty SQL file"
          >
            + New
          </button>
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            className="rounded px-1.5 py-0.5 text-[11px] text-body transition-colors hover:bg-card hover:text-heading"
            title="Upload .sql files"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={onCollapse}
            className="rounded px-1 text-[12px] leading-none text-muted transition-colors hover:bg-card hover:text-heading"
            title="Hide the file explorer"
            aria-label="Hide the file explorer"
          >
            «
          </button>
        </div>
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept={SQL_FILE_EXTENSIONS.join(",")}
        multiple
        className="hidden"
        onChange={(event) => {
          onUploadFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {files.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-[12px] leading-relaxed text-muted">
              Drop <code className="font-mono">.sql</code> files here, upload them, or pick an
              example from the canvas.
            </p>
          </div>
        ) : null}

        {files.map((file) => {
          const tables = tablesByFileId[file.id] ?? [];
          const isActive = file.id === activeFileId;

          return (
            <div key={file.id} className="mb-1">
              <div
                className={`group flex items-center gap-1.5 rounded px-2 py-1 ${
                  isActive ? "bg-card" : "hover:bg-card/70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={file.enabled}
                  onChange={() => onToggleFile(file.id)}
                  className="h-3 w-3 shrink-0 accent-[var(--color-accent)]"
                  title={file.enabled ? "Exclude from diagram" : "Include in diagram"}
                />
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: accentByFileId[file.id] }}
                />

                {renamingFileId === file.id ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        commitRename();
                      }

                      if (event.key === "Escape") {
                        setRenamingFileId(null);
                      }
                    }}
                    className="min-w-0 flex-1 rounded border border-border bg-page px-1 font-mono text-[12px] text-heading outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectFile(file.id)}
                    onDoubleClick={() => {
                      setRenamingFileId(file.id);
                      setDraftName(file.name);
                    }}
                    className={`min-w-0 flex-1 truncate text-left font-mono text-[12px] ${
                      file.enabled ? "text-heading" : "text-muted line-through"
                    }`}
                    title={`${file.name} — double-click to rename`}
                  >
                    {file.name}
                  </button>
                )}

                <span className="shrink-0 font-mono text-[10px] text-muted">{tables.length}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="shrink-0 rounded px-1 text-[12px] leading-none text-muted opacity-0 transition-opacity hover:text-heading group-hover:opacity-100"
                  title={`Remove ${file.name}`}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>

              {isActive && tables.length ? (
                <ul className="ml-5 border-l border-border pl-2">
                  {tables.map((table) => (
                    <li key={table.id}>
                      <button
                        type="button"
                        onClick={() => onSelectTable(table.id)}
                        className={`w-full truncate rounded px-1.5 py-0.5 text-left font-mono text-[11px] transition-colors ${
                          selection.kind === "table" && selection.id === table.id
                            ? "bg-accent/15 text-heading"
                            : "text-body hover:text-heading"
                        }`}
                      >
                        {table.name}
                        {table.isStub ? <span className="text-muted"> (inferred)</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
