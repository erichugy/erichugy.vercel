"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { ParseIssue, ParsedTable, SqlFile } from "@/tools/sql-erd";

import SqlSyntaxHelp from "./sql-syntax-help";

// CodeMirror needs the DOM, and it is a heavy import for a page that may never
// open the editor, so it is loaded on the client only.
const SqlCodeEditor = dynamic(() => import("./sql-code-editor"), {
  ssr: false,
  loading: () => <div className="flex-1 bg-page" />,
});

export interface ErdSqlEditorProps {
  file: SqlFile | null;
  issues: ParseIssue[];
  tables: ParsedTable[];
  tableCount: number;
  onCollapse: () => void;
  onChange: (sql: string) => void;
}

export default function ErdSqlEditor({
  file,
  issues,
  tables,
  tableCount,
  onCollapse,
  onChange,
}: ErdSqlEditorProps) {
  const [helpOpen, setHelpOpen] = useState(false);
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
          onClick={() => setHelpOpen((current) => !current)}
          className={`shrink-0 rounded px-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors hover:bg-card hover:text-heading ${
            helpOpen ? "bg-card text-heading" : "text-muted"
          }`}
          title="What PostgreSQL syntax this tool reads"
        >
          PostgreSQL ?
        </button>
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

      <div className="min-h-0 flex-1 overflow-hidden bg-page">
        <SqlCodeEditor
          value={file?.sql ?? ""}
          tables={tables}
          readOnly={!file}
          placeholder={
            file
              ? "CREATE TABLE ..."
              : "Select a file in the explorer, or upload a .sql file to get started."
          }
          onChange={onChange}
        />
      </div>

      {issues.length ? (
        <ul className="max-h-28 shrink-0 overflow-y-auto border-t border-border px-3 py-1.5">
          {issues.map((issue, index) => (
            <li key={index} className="font-mono text-[11px] leading-relaxed text-muted">
              ⚠ {issue.message}
            </li>
          ))}
        </ul>
      ) : null}

      {helpOpen ? <SqlSyntaxHelp onClose={() => setHelpOpen(false)} /> : null}
    </div>
  );
}
