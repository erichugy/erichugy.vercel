"use client";

const READS: readonly { statement: string; detail: string }[] = [
  {
    statement: "CREATE TABLE",
    detail:
      "Columns and types, NOT NULL, DEFAULT, PRIMARY KEY, UNIQUE, inline REFERENCES, and table-level PRIMARY KEY / UNIQUE / FOREIGN KEY (composite keys included).",
  },
  {
    statement: "ALTER TABLE … ADD",
    detail: "ADD CONSTRAINT … FOREIGN KEY / PRIMARY KEY / UNIQUE, and ADD COLUMN.",
  },
  { statement: "CREATE [UNIQUE] INDEX", detail: "Listed under the table it indexes." },
  { statement: "COMMENT ON TABLE / COLUMN", detail: "Shown in the inspector and on hover." },
];

const SKIPS: readonly string[] = [
  "CREATE TYPE, VIEW, FUNCTION, TRIGGER, EXTENSION",
  "INSERT, SELECT, UPDATE, GRANT and other DML",
  "CHECK bodies and CREATE TABLE … AS SELECT",
];

export default function SqlSyntaxHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex max-h-[60%] shrink-0 flex-col border-t border-border bg-page-alt">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
          PostgreSQL syntax
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-1 text-[13px] leading-none text-muted transition-colors hover:text-heading"
          aria-label="Close the syntax reference"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto p-3">
        <p className="mb-3 text-[11px] leading-relaxed text-body">
          Files are read as PostgreSQL DDL. Anything the diagram cannot use is skipped rather than
          rejected, so a full <code className="font-mono">pg_dump</code> or migration file works —
          only the statements below shape the diagram.
        </p>

        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-muted">
          Read
        </span>
        <dl className="mb-3 space-y-1.5">
          {READS.map((entry) => (
            <div key={entry.statement}>
              <dt className="font-mono text-[11px] text-heading">{entry.statement}</dt>
              <dd className="text-[11px] leading-relaxed text-muted">{entry.detail}</dd>
            </div>
          ))}
        </dl>

        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-muted">
          Ignored
        </span>
        <ul className="mb-3 space-y-0.5">
          {SKIPS.map((entry) => (
            <li key={entry} className="text-[11px] leading-relaxed text-muted">
              {entry}
            </li>
          ))}
        </ul>

        <span className="mb-1 block font-mono text-[10px] uppercase tracking-wide text-muted">
          Good to know
        </span>
        <ul className="space-y-0.5 text-[11px] leading-relaxed text-muted">
          <li>
            A <code className="font-mono">public.</code> prefix is dropped, so{" "}
            <code className="font-mono">public.users</code> and{" "}
            <code className="font-mono">users</code> are the same table.
          </li>
          <li>
            A foreign key pointing at a table you have not defined still draws a node, marked{" "}
            <span className="uppercase">inferred</span>.
          </li>
          <li>MySQL backticks and AUTO_INCREMENT are tolerated, but not a supported target.</li>
        </ul>
      </div>
    </div>
  );
}
