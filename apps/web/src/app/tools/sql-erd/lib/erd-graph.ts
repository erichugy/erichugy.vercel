import type { Edge } from "@xyflow/react";

import {
  CARDINALITY_ENDPOINTS,
  measureNodeHeight,
  NODE_WIDTH,
  type DiagramRelation,
  type NodePosition,
  type ParsedTable,
} from "@/tools/sql-erd";

import { selectionTableId, type ErdSelection, type RelationEdgeData, type TableNode } from "../sql-erd.types";

const HANDLE_SEPARATOR = "::";

/** Horizontal gap between the parallel channels edges are fanned out into. */
const CHANNEL_GAP = 16;
/** Edges whose natural turn lands within this many pixels share a channel group. */
const CHANNEL_BUCKET = 48;

export function makeHandleId(columnName: string, side: "left" | "right"): string {
  return `${columnName}${HANDLE_SEPARATOR}${side}`;
}

export function parseHandleId(handleId: string | null | undefined): string | null {
  if (!handleId) {
    return null;
  }

  const separatorIndex = handleId.lastIndexOf(HANDLE_SEPARATOR);

  return separatorIndex === -1 ? handleId : handleId.slice(0, separatorIndex);
}

export interface BuildNodesOptions {
  tables: ParsedTable[];
  relations: DiagramRelation[];
  positions: Record<string, NodePosition>;
  collapsedTableIds: ReadonlySet<string>;
  nameByFileId: Record<string, string>;
  accentByTableId: Record<string, string>;
  selection: ErdSelection;
  /** Nodes React Flow itself has selected — a click, or a marquee covering several. */
  selectedNodeIds: ReadonlySet<string>;
}

/** Every selected table plus its direct neighbours; null when nothing is selected. */
function computeHighlightedTables(
  relations: DiagramRelation[],
  selectedTableIds: ReadonlySet<string>,
  selection: ErdSelection,
): Set<string> | null {
  if (selectedTableIds.size) {
    const highlighted = new Set<string>(selectedTableIds);

    for (const relation of relations) {
      if (selectedTableIds.has(relation.sourceTable)) {
        highlighted.add(relation.targetTable);
      }

      if (selectedTableIds.has(relation.targetTable)) {
        highlighted.add(relation.sourceTable);
      }
    }

    return highlighted;
  }

  if (selection.kind === "relation") {
    const relation = relations.find((entry) => entry.id === selection.id);

    return relation ? new Set([relation.sourceTable, relation.targetTable]) : null;
  }

  return null;
}

export function buildNodes(options: BuildNodesOptions): TableNode[] {
  const { tables, relations, positions, collapsedTableIds, nameByFileId } = options;

  const connectedColumns = new Map<string, Set<string>>();

  const track = (tableId: string, columns: string[]) => {
    const existing = connectedColumns.get(tableId) ?? new Set<string>();

    for (const column of columns) {
      existing.add(column.toLowerCase());
    }

    connectedColumns.set(tableId, existing);
  };

  for (const relation of relations) {
    track(relation.sourceTable, relation.sourceColumns);
    track(relation.targetTable, relation.targetColumns);
  }

  // The inspector's table and the canvas multi-selection are both "selected".
  const selectedTableIds = new Set(options.selectedNodeIds);
  const inspectorTableId = selectionTableId(options.selection);

  if (inspectorTableId) {
    selectedTableIds.add(inspectorTableId);
  }

  const highlighted = computeHighlightedTables(relations, selectedTableIds, options.selection);

  return tables.map((table) => {
    const collapsed = collapsedTableIds.has(table.id);
    const height = measureNodeHeight(table, collapsed);

    return {
      id: table.id,
      type: "erdTable" as const,
      position: positions[table.id] ?? { x: 0, y: 0 },
      selected: selectedTableIds.has(table.id),
      deletable: false,
      // Declared rather than measured so the minimap and auto-layout agree with the DOM.
      width: NODE_WIDTH,
      height,
      // `measured` must be set too: React Flow drops a node's cached handle bounds
      // whenever a node object changes without it, so every drag frame would leave the
      // dragged node's edges unable to resolve their endpoints, unmounting them.
      measured: { width: NODE_WIDTH, height },
      data: {
        table,
        accent: options.accentByTableId[table.id] ?? "#0EA5C9",
        fileName: nameByFileId[table.fileId] ?? "unknown",
        collapsed,
        connectedColumns: connectedColumns.get(table.id) ?? new Set<string>(),
        selectedColumn:
          options.selection.kind === "column" && options.selection.tableId === table.id
            ? options.selection.columnName
            : null,
        dimmed: highlighted ? !highlighted.has(table.id) : false,
      },
    };
  });
}

export interface BuildEdgesOptions {
  relations: DiagramRelation[];
  positions: Record<string, NodePosition>;
  selection: ErdSelection;
  tables: ParsedTable[];
}

/** `tableId::column` (lowercased) for every column the DDL declared nullable. */
function collectNullableColumns(tables: ParsedTable[]): Set<string> {
  const nullable = new Set<string>();

  for (const table of tables) {
    for (const column of table.columns) {
      if (column.nullable) {
        nullable.add(`${table.id}::${column.name.toLowerCase()}`);
      }
    }
  }

  return nullable;
}

interface EdgeGeometry {
  /** X the smooth-step router would turn at if the edge were routed on its own. */
  centerX: number;
  targetIsRight: boolean;
}

function measureEdge(relation: DiagramRelation, positions: Record<string, NodePosition>): EdgeGeometry {
  const sourceLeft = positions[relation.sourceTable]?.x ?? 0;
  const targetLeft = positions[relation.targetTable]?.x ?? 0;
  const targetIsRight = targetLeft + NODE_WIDTH / 2 >= sourceLeft + NODE_WIDTH / 2;

  const sourceX = targetIsRight ? sourceLeft + NODE_WIDTH : sourceLeft;
  const targetX = targetIsRight ? targetLeft : targetLeft + NODE_WIDTH;

  return { centerX: (sourceX + targetX) / 2, targetIsRight };
}

/**
 * Smooth-step edges turn at the midpoint between their two nodes, so every edge
 * crossing the same gap stacks into one vertical line and the diagram reads as a
 * single trunk. Bucketing by that turn and fanning each bucket out sideways gives
 * every edge its own channel, which is what makes the individual links followable.
 */
function computeChannelOffsets(
  relations: DiagramRelation[],
  geometry: Map<string, EdgeGeometry>,
): Map<string, number> {
  const buckets = new Map<string, DiagramRelation[]>();

  for (const relation of relations) {
    const centerX = geometry.get(relation.id)?.centerX ?? 0;
    const key = String(Math.round(centerX / CHANNEL_BUCKET));

    buckets.set(key, [...(buckets.get(key) ?? []), relation]);
  }

  const offsets = new Map<string, number>();

  for (const bucket of buckets.values()) {
    // Sorted by id so the fan order is stable across re-parses rather than following
    // whatever order the parser happened to emit relations in.
    const ordered = [...bucket].sort((left, right) => left.id.localeCompare(right.id));

    ordered.forEach((relation, index) => {
      offsets.set(relation.id, (index - (ordered.length - 1) / 2) * CHANNEL_GAP);
    });
  }

  return offsets;
}

export function buildEdges({
  relations,
  positions,
  selection,
  tables,
}: BuildEdgesOptions): Edge<RelationEdgeData>[] {
  const nullableColumns = collectNullableColumns(tables);
  const geometry = new Map(relations.map((relation) => [relation.id, measureEdge(relation, positions)]));
  const channelOffsets = computeChannelOffsets(relations, geometry);

  const hasNullableColumn = (tableId: string, columns: string[]) =>
    columns.some((column) => nullableColumns.has(`${tableId}::${column.toLowerCase()}`));

  return relations.map((relation) => {
    const targetIsRight = geometry.get(relation.id)?.targetIsRight ?? true;
    const [sourceMark, targetMark] = CARDINALITY_ENDPOINTS[relation.cardinality];

    const sourceColumn = relation.sourceColumns[0] ?? "";
    const targetColumn = relation.targetColumns[0] ?? "";
    // Cardinality now reads off the edge ends, so the midpoint carries only a custom label.
    const label = relation.label?.trim() ?? "";
    const isSelected = selection.kind === "relation" && selection.id === relation.id;
    const focusedTable = selectionTableId(selection);
    const isDimmed =
      focusedTable !== null &&
      relation.sourceTable !== focusedTable &&
      relation.targetTable !== focusedTable;

    return {
      id: relation.id,
      type: "erdRelation",
      source: relation.sourceTable,
      target: relation.targetTable,
      sourceHandle: makeHandleId(sourceColumn, targetIsRight ? "right" : "left"),
      targetHandle: makeHandleId(targetColumn, targetIsRight ? "left" : "right"),
      selected: isSelected,
      reconnectable: true,
      data: {
        relation,
        label,
        channelOffset: channelOffsets.get(relation.id) ?? 0,
        // Only a "one" end can be optional, and it is optional when the key pointing at
        // it from the other side is nullable — that row may have no counterpart at all,
        // which crow's-foot notation marks with a ring.
        sourceOptional:
          sourceMark === "one" && hasNullableColumn(relation.targetTable, relation.targetColumns),
        targetOptional:
          targetMark === "one" && hasNullableColumn(relation.sourceTable, relation.sourceColumns),
      },
      className: isDimmed ? "erd-edge-dimmed" : undefined,
    };
  });
}
