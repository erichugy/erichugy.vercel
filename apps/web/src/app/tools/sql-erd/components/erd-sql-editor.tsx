"use client";

import type { ParseIssue, SqlFile } from "@/tools/sql-erd";

export interface ErdSqlEditorProps {
  file: SqlFile | null;
  issues: ParseIssue[];
  tableCount: number;
  onCollapse: () => void;
  onChange: (sql: string) => void;
}

export default function ErdSqlEditor({
  file,
  issues,
  tableCount,
  onCollapse,
  onChange,
}: ErdSqlEditorProps) {
  const lineCount = file ? file.sql.split("\n").length : 0;

  return (
    <div className="flex h-full flex-col border-r border-border bg-page-alt">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-heading">
          {file ? file.name : "No file selected"}
        </span>
        {file ? (
          <span className="shrink-0 font-mono text-[10px] text-muted">
            {tableCount} table{tableCount === 1 ? "" : "s"} · {lineCount} lines
          </span>
        ) : null}
        <button
          type="button"
          onClick={onCollapse}
          className="shrink-0 rounded px-1 font-mono text-[12px] leading-none text-muted transition-colors hover:bg-card hover:text-heading"
          title="Hide the editor"
          aria-label="Hide the editor"
        >
          «
        </button>
      </div>

      <textarea
        value={file?.sql ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={!file}
        spellCheck={false}
        placeholder={
          file
            ? "CREATE TABLE ..."
            : "Select a file in the explorer, or upload a .sql file to get started."
        }
        className="min-h-0 flex-1 resize-none bg-page p-3 font-mono text-[12px] leading-5 text-heading outline-none placeholder:text-muted disabled:opacity-60"
      />

      {issues.length ? (
        <ul className="max-h-28 shrink-0 overflow-y-auto border-t border-border px-3 py-1.5">
          {issues.map((issue, index) => (
            <li key={index} className="font-mono text-[11px] leading-relaxed text-muted">
              ⚠ {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
