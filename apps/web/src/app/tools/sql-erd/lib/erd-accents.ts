import type { DiagramRelation, ParsedTable } from "@/tools/sql-erd";

import { TABLE_ACCENTS } from "../sql-erd.constants";

/** Tables that share at least one relation, keyed by table id. */
function collectNeighbours(relations: DiagramRelation[]): Map<string, Set<string>> {
  const neighbours = new Map<string, Set<string>>();

  const link = (from: string, to: string) => {
    const existing = neighbours.get(from) ?? new Set<string>();

    existing.add(to);
    neighbours.set(from, existing);
  };

  for (const relation of relations) {
    link(relation.sourceTable, relation.targetTable);
    link(relation.targetTable, relation.sourceTable);
  }

  return neighbours;
}

/**
 * Picks a header colour for every table.
 *
 * Walking the palette in order is what keeps a screenful of tables looking varied; a
 * hash of the table name reads as random but clumps badly, and on a 15-table schema it
 * hands the same colour to tables sitting side by side. On top of that rotation, a
 * table skips any colour one of its related tables already took, so the two ends of an
 * edge are never the same colour — that pair is the one a reader actually compares.
 *
 * Tables are walked in id order so the assignment does not depend on parse order.
 */
export function buildAccentMap(
  tables: ParsedTable[],
  relations: DiagramRelation[],
): Record<string, string> {
  const neighbours = collectNeighbours(relations);
  const ordered = [...tables].sort((left, right) => left.id.localeCompare(right.id));
  const accents: Record<string, string> = {};

  ordered.forEach((table, index) => {
    const taken = new Set<string>();

    for (const neighbour of neighbours.get(table.id) ?? []) {
      const assigned = accents[neighbour];

      if (assigned) {
        taken.add(assigned);
      }
    }

    const rotated = TABLE_ACCENTS.map(
      (_, step) => TABLE_ACCENTS[(index + step) % TABLE_ACCENTS.length],
    );

    accents[table.id] = rotated.find((colour) => !taken.has(colour)) ?? rotated[0];
  });

  return accents;
}
