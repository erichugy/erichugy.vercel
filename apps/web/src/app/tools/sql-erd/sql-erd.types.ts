import type { Node } from "@xyflow/react";

import type { DiagramRelation, ParsedTable } from "@/tools/sql-erd";

export interface TableNodeData extends Record<string, unknown> {
  table: ParsedTable;
  accent: string;
  fileName: string;
  collapsed: boolean;
  /** Column names that take part in at least one relation, highlighted on the node. */
  connectedColumns: Set<string>;
  /** Column the inspector is showing, highlighted in the node. */
  selectedColumn: string | null;
  /** Faded because something else is selected and this table is unrelated to it. */
  dimmed: boolean;
}

export type TableNode = Node<TableNodeData, "erdTable">;

export interface RelationEdgeData extends Record<string, unknown> {
  relation: DiagramRelation;
  label: string;
  /** Sideways shift of the edge's vertical channel, so parallel edges stay apart. */
  channelOffset: number;
  /** Draw the crow's-foot "zero" ring at that end. */
  sourceOptional: boolean;
  targetOptional: boolean;
}

export type ErdSelection =
  | { kind: "none" }
  | { kind: "table"; id: string }
  | { kind: "column"; tableId: string; columnName: string }
  | { kind: "relation"; id: string };

/** The table a selection belongs to, so highlighting treats a column like its table. */
export function selectionTableId(selection: ErdSelection): string | null {
  if (selection.kind === "table") {
    return selection.id;
  }

  if (selection.kind === "column") {
    return selection.tableId;
  }

  return null;
}

/** Identity of a selection, used to drop canvas multi-selection when it changes. */
export function selectionKey(selection: ErdSelection): string {
  if (selection.kind === "table") {
    return `table:${selection.id}`;
  }

  if (selection.kind === "column") {
    return `column:${selection.tableId}:${selection.columnName}`;
  }

  if (selection.kind === "relation") {
    return `relation:${selection.id}`;
  }

  return "none";
}

/** Patch applied to a relation from the inspector or by dragging an edge endpoint. */
export interface RelationPatch {
  sourceTable?: string;
  sourceColumns?: string[];
  targetTable?: string;
  targetColumns?: string[];
  cardinality?: DiagramRelation["cardinality"];
  label?: string;
}
