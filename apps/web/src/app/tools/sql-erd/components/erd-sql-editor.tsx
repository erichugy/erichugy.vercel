"use client";

import type { ParseIssue, SqlFile } from "@/tools/sql-erd";

export interface ErdSqlEditorProps {
  file: SqlFile | null;
  issues: ParseIssue[];
  tableCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onChange: (sql: string) => void;
  onStartResize: (event: React.PointerEvent) => void;
}

export default function ErdSqlEditor({
  file,
  issues,
  tableCount,
  collapsed,
  onToggleCollapsed,
  onChange,
  onStartResize,
}: ErdSqlEditorProps) {
  return (
    <div className="flex h-full flex-col border-t border-border bg-page-alt">
      <div
        className="flex h-1.5 w-full shrink-0 cursor-row-resize items-center justify-center bg-transparent hover:bg-accent/20"
        onPointerDown={onStartResize}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize SQL editor"
      >
        <span className="h-[2px] w-8 rounded bg-border" />
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-[12px] text-heading">
            {file ? file.name : "No file selected"}
          </span>
          {file ? (
            <span className="shrink-0 font-mono text-[10px] text-muted">
              {tableCount} table{tableCount === 1 ? "" : "s"} · {file.sql.length} chars
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] text-body transition-colors hover:bg-card hover:text-heading"
        >
          {collapsed ? "Show SQL ▲" : "Hide SQL ▼"}
        </button>
      </div>

      {collapsed ? null : (
        <div className="flex min-h-0 flex-1 flex-col">
          <textarea
            value={file?.sql ?? ""}
            onChange={(event) => onChange(event.target.value)}
            disabled={!file}
            spellCheck={false}
            placeholder={
              file
                ? "CREATE TABLE ..."
                : "Select a file on the left, or upload a .sql file to get started."
            }
            className="min-h-0 flex-1 resize-none bg-page p-3 font-mono text-[12px] leading-5 text-heading outline-none placeholder:text-muted disabled:opacity-60"
          />

          {issues.length ? (
            <ul className="max-h-24 shrink-0 overflow-y-auto border-t border-border bg-page-alt px-3 py-1.5">
              {issues.map((issue, index) => (
                <li key={index} className="font-mono text-[11px] text-muted">
                  ⚠ {issue.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
