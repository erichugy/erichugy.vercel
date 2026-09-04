import type { NodePosition, ParsedRelation, ParsedTable } from "./types";

export const NODE_WIDTH = 260;
export const NODE_HEADER_HEIGHT = 38;
export const NODE_ROW_HEIGHT = 22;
export const NODE_SECTION_HEADER_HEIGHT = 22;
export const NODE_PADDING = 8;
const NODE_BORDER = 1;

const LAYER_GAP = 140;
const ROW_GAP = 60;
const MAX_ORDERING_SWEEPS = 6;

/**
 * Node heights are declared rather than measured, so the DOM in `erd-table-node`
 * must keep these exact paddings and row heights or edges will land off-target.
 */
export function measureNodeHeight(table: ParsedTable, collapsed: boolean): number {
  const chrome = NODE_BORDER * 2 + NODE_HEADER_HEIGHT;

  if (collapsed) {
    return chrome;
  }

  const indexRows = table.indexes.length
    ? NODE_BORDER + NODE_SECTION_HEADER_HEIGHT + table.indexes.length * NODE_ROW_HEIGHT
    : 0;

  return chrome + NODE_PADDING * 2 + table.columns.length * NODE_ROW_HEIGHT + indexRows;
}

/**
 * Ranks tables so that a referenced (parent) table sits one layer to the right of
 * the table referencing it, then orders each layer by the median position of its
 * neighbours. Cheap, deterministic, and good enough to read an ERD at a glance —
 * no graph-layout dependency required.
 */
export function computeLayout(
  tables: ParsedTable[],
  relations: ParsedRelation[],
  collapsedTableIds: ReadonlySet<string> = new Set(),
): Record<string, NodePosition> {
  if (!tables.length) {
    return {};
  }

  const tableIds = tables.map((table) => table.id);
  const known = new Set(tableIds);
  const edges = relations.filter(
    (relation) =>
      known.has(relation.sourceTable) &&
      known.has(relation.targetTable) &&
      relation.sourceTable !== relation.targetTable,
  );

  const rank = new Map<string, number>(tableIds.map((id) => [id, 0]));

  // Longest-path ranking, bounded by table count so cycles cannot spin forever.
  for (let pass = 0; pass < tableIds.length; pass += 1) {
    let changed = false;

    for (const edge of edges) {
      const candidate = (rank.get(edge.sourceTable) ?? 0) + 1;

      if (candidate > (rank.get(edge.targetTable) ?? 0)) {
        rank.set(edge.targetTable, candidate);
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  const layers = new Map<number, string[]>();

  for (const id of tableIds) {
    const layerIndex = rank.get(id) ?? 0;
    const layer = layers.get(layerIndex) ?? [];
    layer.push(id);
    layers.set(layerIndex, layer);
  }

  const layerIndexes = [...layers.keys()].sort((left, right) => left - right);

  for (const layerIndex of layerIndexes) {
    layers.get(layerIndex)!.sort();
  }

  const orderWithin = new Map<string, number>();

  const reindex = () => {
    for (const layerIndex of layerIndexes) {
      layers.get(layerIndex)!.forEach((id, position) => orderWithin.set(id, position));
    }
  };

  reindex();

  const neighbours = new Map<string, string[]>(tableIds.map((id) => [id, []]));

  for (const edge of edges) {
    neighbours.get(edge.sourceTable)!.push(edge.targetTable);
    neighbours.get(edge.targetTable)!.push(edge.sourceTable);
  }

  for (let sweep = 0; sweep < MAX_ORDERING_SWEEPS; sweep += 1) {
    for (const layerIndex of layerIndexes) {
      const layer = layers.get(layerIndex)!;

      const median = (id: string): number => {
        const positions = neighbours
          .get(id)!
          .map((neighbour) => orderWithin.get(neighbour))
          .filter((position): position is number => position !== undefined)
          .sort((left, right) => left - right);

        if (!positions.length) {
          return orderWithin.get(id) ?? 0;
        }

        return positions[Math.floor(positions.length / 2)];
      };

      const scored = layer.map((id, position) => ({ id, score: median(id), position }));
      scored.sort((left, right) => left.score - right.score || left.position - right.position);
      layers.set(
        layerIndex,
        scored.map((entry) => entry.id),
      );
    }

    reindex();
  }

  const heights = new Map<string, number>(
    tables.map((table) => [table.id, measureNodeHeight(table, collapsedTableIds.has(table.id))]),
  );

  const positions: Record<string, NodePosition> = {};
  let x = 0;

  for (const layerIndex of layerIndexes) {
    const layer = layers.get(layerIndex)!;
    const totalHeight = layer.reduce(
      (sum, id, index) => sum + (heights.get(id) ?? 0) + (index ? ROW_GAP : 0),
      0,
    );

    let y = -totalHeight / 2;

    for (const id of layer) {
      positions[id] = { x, y };
      y += (heights.get(id) ?? 0) + ROW_GAP;
    }

    x += NODE_WIDTH + LAYER_GAP;
  }

  return positions;
}

/** Places tables that have no saved position without disturbing the ones that do. */
export function placeMissingTables(
  tables: ParsedTable[],
  relations: ParsedRelation[],
  existing: Record<string, NodePosition>,
  collapsedTableIds: ReadonlySet<string> = new Set(),
): Record<string, NodePosition> {
  const missing = tables.filter((table) => !existing[table.id]);

  if (!missing.length) {
    return existing;
  }

  const placedValues = Object.values(existing);

  if (!placedValues.length) {
    return computeLayout(tables, relations, collapsedTableIds);
  }

  const rightEdge = Math.max(...placedValues.map((position) => position.x)) + NODE_WIDTH + LAYER_GAP;
  const topEdge = Math.min(...placedValues.map((position) => position.y));
  const fresh = computeLayout(missing, relations, collapsedTableIds);
  const next = { ...existing };

  for (const table of missing) {
    const offset = fresh[table.id] ?? { x: 0, y: 0 };
    next[table.id] = { x: rightEdge + offset.x, y: topEdge + offset.y };
  }

  return next;
}
