"use client";

import type { ReactNode } from "react";

import {
  CARDINALITY_LABELS,
  type DiagramRelation,
  type ParsedColumn,
  type ParsedTable,
  type RelationCardinality,
} from "@/tools/sql-erd";


import type { ErdSelection, RelationPatch } from "../sql-erd.types";

const CARDINALITY_OPTIONS: RelationCardinality[] = [
  "one-to-one",
  "one-to-many",
  "many-to-one",
  "many-to-many",
];

const BADGE_CLASS =
  "rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-body";

/** One labelled row in the column panel. */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 border-b border-border/60 py-1 last:border-b-0">
      <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed text-heading">
        {children}
      </div>
    </div>
  );
}

const SELECT_CLASS =
  "w-full rounded border border-border bg-page px-2 py-1 font-mono text-[11px] text-heading outline-none focus:border-accent";
const FIELD_LABEL_CLASS = "mb-1 block font-mono text-[10px] uppercase tracking-wide text-muted";

export interface ErdInspectorProps {
  selection: ErdSelection;
  tables: ParsedTable[];
  relations: DiagramRelation[];
  onSelect: (selection: ErdSelection) => void;
  onUpdateRelation: (relation: DiagramRelation, patch: RelationPatch) => void;
  onDeleteRelation: (relation: DiagramRelation) => void;
  onToggleCollapsed: (tableId: string) => void;
  onClose: () => void;
}

function RelationEndpointFields({
  role,
  tables,
  tableId,
  columnName,
  onChange,
}: {
  role: "source" | "target";
  tables: ParsedTable[];
  tableId: string;
  columnName: string;
  onChange: (patch: RelationPatch) => void;
}) {
  const table = tables.find((entry) => entry.id === tableId);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <span className={FIELD_LABEL_CLASS}>{role} table</span>
        <select
          className={SELECT_CLASS}
          value={tableId}
          onChange={(event) =>
            onChange(
              role === "source"
                ? { sourceTable: event.target.value, sourceColumns: [] }
                : { targetTable: event.target.value, targetColumns: [] },
            )
          }
        >
          {tables.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className={FIELD_LABEL_CLASS}>{role} column</span>
        <select
          className={SELECT_CLASS}
          value={columnName}
          onChange={(event) =>
            onChange(
              role === "source"
                ? { sourceColumns: [event.target.value] }
                : { targetColumns: [event.target.value] },
            )
          }
        >
          <option value="">—</option>
          {table?.columns.map((column) => (
            <option key={column.name} value={column.name}>
              {column.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ColumnPanel({
  table,
  column,
  relations,
  onSelect,
}: {
  table: ParsedTable;
  column: ParsedColumn;
  relations: DiagramRelation[];
  onSelect: (selection: ErdSelection) => void;
}) {
  const references = relations.filter(
    (relation) =>
      relation.sourceTable === table.id &&
      relation.sourceColumns.some((name) => name.toLowerCase() === column.name.toLowerCase()),
  );
  const referencedBy = relations.filter(
    (relation) =>
      relation.targetTable === table.id &&
      relation.targetColumns.some((name) => name.toLowerCase() === column.name.toLowerCase()),
  );
  const indexes = table.indexes.filter((index) =>
    index.columns.some((name) => name.toLowerCase() === column.name.toLowerCase()),
  );
  const isInPrimaryKey = table.primaryKey.some(
    (name) => name.toLowerCase() === column.name.toLowerCase(),
  );

  // A column is constrained either by an enum type or by a membership CHECK.
  const allowedValues = column.enumValues ?? column.checkValues;
  const allowedSource = column.enumValues
    ? `enum type ${column.type}`
    : "CHECK constraint";

  return (
    <div className="space-y-3">
      <div>
        <h3 className="break-all font-mono text-[14px] font-semibold text-heading">
          {column.name}
        </h3>
        <button
          type="button"
          onClick={() => onSelect({ kind: "table", id: table.id })}
          className="font-mono text-[11px] text-muted transition-colors hover:text-heading"
        >
          in {table.name} ↑
        </button>
        {column.comment ? (
          <p className="mt-1 text-[11px] leading-relaxed text-body">{column.comment}</p>
        ) : null}
      </div>

      <div>
        <DetailRow label="Type">{column.type || "unknown"}</DetailRow>
        <DetailRow label="Nullable">{column.nullable ? "yes" : "no — NOT NULL"}</DetailRow>
        <DetailRow label="Default">{column.defaultExpression ?? "—"}</DetailRow>
        <DetailRow label="Keys">
          {isInPrimaryKey || column.isUnique || column.isAutoIncrement ? (
            <span className="flex flex-wrap gap-1">
              {isInPrimaryKey ? <span className={BADGE_CLASS}>primary key</span> : null}
              {column.isUnique ? <span className={BADGE_CLASS}>unique</span> : null}
              {column.isAutoIncrement ? <span className={BADGE_CLASS}>generated</span> : null}
            </span>
          ) : (
            "—"
          )}
        </DetailRow>
      </div>

      {allowedValues?.length ? (
        <div>
          <span className={FIELD_LABEL_CLASS}>Allowed values ({allowedValues.length})</span>
          <ul className="mb-1 flex flex-wrap gap-1">
            {allowedValues.map((value) => (
              <li key={value} className={BADGE_CLASS}>
                {value}
              </li>
            ))}
          </ul>
          <span className="font-mono text-[10px] text-muted">from {allowedSource}</span>
        </div>
      ) : null}

      {references.length ? (
        <div>
          <span className={FIELD_LABEL_CLASS}>References</span>
          <ul className="space-y-1">
            {references.map((relation) => (
              <li key={relation.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ kind: "relation", id: relation.id })}
                  className="w-full truncate rounded border border-border bg-card px-2 py-1 text-left font-mono text-[10px] text-body transition-colors hover:text-heading"
                >
                  → {relation.targetTable}.{relation.targetColumns[0] ?? "?"}
                  {relation.onDelete ? ` · on delete ${relation.onDelete.toLowerCase()}` : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {referencedBy.length ? (
        <div>
          <span className={FIELD_LABEL_CLASS}>Referenced by</span>
          <ul className="space-y-1">
            {referencedBy.map((relation) => (
              <li key={relation.id}>
                <button
                  type="button"
                  onClick={() => onSelect({ kind: "relation", id: relation.id })}
                  className="w-full truncate rounded border border-border bg-card px-2 py-1 text-left font-mono text-[10px] text-body transition-colors hover:text-heading"
                >
                  ← {relation.sourceTable}.{relation.sourceColumns[0] ?? "?"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {indexes.length ? (
        <div>
          <span className={FIELD_LABEL_CLASS}>In indexes</span>
          <ul className="space-y-1">
            {indexes.map((index, position) => (
              <li
                key={`${index.name ?? "idx"}-${position}`}
                className="truncate rounded border border-border bg-card px-2 py-1 font-mono text-[10px] text-body"
              >
                {index.unique ? "unique " : ""}({index.columns.join(", ")})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function ErdInspector({
  selection,
  tables,
  relations,
  onSelect,
  onUpdateRelation,
  onDeleteRelation,
  onToggleCollapsed,
  onClose,
}: ErdInspectorProps) {
  const table =
    selection.kind === "table" ? tables.find((entry) => entry.id === selection.id) : undefined;
  const columnTable =
    selection.kind === "column"
      ? tables.find((entry) => entry.id === selection.tableId)
      : undefined;
  const column =
    selection.kind === "column"
      ? columnTable?.columns.find((entry) => entry.name === selection.columnName)
      : undefined;
  const relation =
    selection.kind === "relation"
      ? relations.find((entry) => entry.id === selection.id)
      : undefined;

  if (!table && !relation && !(columnTable && column)) {
    return null;
  }

  const panelLabel = table ? "Table" : column ? "Column" : "Relationship";

  return (
    <aside className="pointer-events-auto flex max-h-full w-[280px] flex-col overflow-hidden rounded-lg border border-border bg-page-alt shadow-[0_8px_24px_rgba(12,27,33,0.16)]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
          {panelLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-1 text-[13px] leading-none text-muted transition-colors hover:text-heading"
          aria-label="Close inspector"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {columnTable && column ? (
          <ColumnPanel
            table={columnTable}
            column={column}
            relations={relations}
            onSelect={onSelect}
          />
        ) : null}

        {table ? (
          <div className="space-y-3">
            <div>
              <h3 className="font-mono text-[14px] font-semibold text-heading">{table.name}</h3>
              <p className="font-mono text-[11px] text-muted">
                {table.schema ? `${table.schema} · ` : ""}
                {table.columns.length} columns · {table.indexes.length} indexes
              </p>
              {table.comment ? (
                <p className="mt-1 text-[11px] leading-relaxed text-body">{table.comment}</p>
              ) : null}
              {table.isStub ? (
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Inferred from a foreign key — no CREATE TABLE for it was found.
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => onToggleCollapsed(table.id)}
              className="w-full rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-body transition-colors hover:text-heading"
            >
              Toggle collapse (or double-click the node)
            </button>

            <div>
              <span className={FIELD_LABEL_CLASS}>Columns</span>
              <ul className="space-y-0.5">
                {table.columns.map((entry) => (
                  <li key={entry.name}>
                    <button
                      type="button"
                      onClick={() =>
                        onSelect({ kind: "column", tableId: table.id, columnName: entry.name })
                      }
                      className="flex w-full items-center justify-between gap-2 rounded px-1.5 py-0.5 text-left font-mono text-[11px] text-body transition-colors hover:bg-card hover:text-heading"
                    >
                      <span className="truncate">{entry.name}</span>
                      <span className="shrink-0 text-muted">
                        {entry.displayType}
                        {entry.nullable ? "?" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className={FIELD_LABEL_CLASS}>Relationships</span>
              <ul className="space-y-1">
                {relations
                  .filter(
                    (entry) => entry.sourceTable === table.id || entry.targetTable === table.id,
                  )
                  .map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => onSelect({ kind: "relation", id: entry.id })}
                        className="w-full truncate rounded border border-border bg-card px-2 py-1 text-left font-mono text-[10px] text-body transition-colors hover:text-heading"
                      >
                        {entry.sourceTable}.{entry.sourceColumns[0] ?? "?"} →{" "}
                        {entry.targetTable}.{entry.targetColumns[0] ?? "?"}
                      </button>
                    </li>
                  ))}
                {relations.every(
                  (entry) => entry.sourceTable !== table.id && entry.targetTable !== table.id,
                ) ? (
                  <li className="font-mono text-[11px] text-muted">None</li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}

        {relation ? (
          <div className="space-y-3">
            <div>
              <h3 className="break-all font-mono text-[12px] font-semibold text-heading">
                {relation.name ?? `${relation.sourceTable} → ${relation.targetTable}`}
              </h3>
              <p className="font-mono text-[10px] text-muted">
                {relation.origin === "derived" ? "from DDL" : "drawn manually"}
                {relation.onDelete ? ` · on delete ${relation.onDelete.toLowerCase()}` : ""}
                {relation.onUpdate ? ` · on update ${relation.onUpdate.toLowerCase()}` : ""}
              </p>
            </div>

            <RelationEndpointFields
              role="source"
              tables={tables}
              tableId={relation.sourceTable}
              columnName={relation.sourceColumns[0] ?? ""}
              onChange={(patch) => onUpdateRelation(relation, patch)}
            />

            <RelationEndpointFields
              role="target"
              tables={tables}
              tableId={relation.targetTable}
              columnName={relation.targetColumns[0] ?? ""}
              onChange={(patch) => onUpdateRelation(relation, patch)}
            />

            <div>
              <span className={FIELD_LABEL_CLASS}>Cardinality</span>
              <select
                className={SELECT_CLASS}
                value={relation.cardinality}
                onChange={(event) =>
                  onUpdateRelation(relation, {
                    cardinality: event.target.value as RelationCardinality,
                  })
                }
              >
                {CARDINALITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {CARDINALITY_LABELS[option]} — {option.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className={FIELD_LABEL_CLASS}>Edge label</span>
              <input
                className={SELECT_CLASS}
                value={relation.label ?? ""}
                placeholder="optional, shown mid-edge"
                onChange={(event) => onUpdateRelation(relation, { label: event.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={() => onDeleteRelation(relation)}
              className="w-full rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-body transition-colors hover:border-accent hover:text-heading"
            >
              Delete relationship
            </button>

            {relation.origin === "derived" ? (
              <p className="text-[10px] leading-relaxed text-muted">
                Repointing a DDL relationship replaces it with a manual one, so re-parsing the SQL
                will not bring the original back.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
