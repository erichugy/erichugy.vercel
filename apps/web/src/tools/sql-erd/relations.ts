import type {
  ErdDocument,
  ParsedRelation,
  ParsedSchema,
  RelationCardinality,
} from "./types";

export interface DiagramRelation extends ParsedRelation {
  /** User-supplied edge label; falls back to the constraint name when absent. */
  label?: string;
}

export const CARDINALITY_LABELS: Record<RelationCardinality, string> = {
  "one-to-one": "1:1",
  "one-to-many": "1:N",
  "many-to-one": "N:1",
  "many-to-many": "N:N",
};

/**
 * Manual relations get an opaque id rather than a content-derived one: the user can
 * repoint an endpoint, and the edge has to keep its identity (and overrides) across that.
 */
export function createManualRelationId(): string {
  return `manual_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Combines relations parsed out of the DDL with the user's manual edits:
 * deletions, endpoint/cardinality overrides, and hand-drawn relations.
 */
export function resolveRelations(schema: ParsedSchema, document: ErdDocument): DiagramRelation[] {
  const hidden = new Set(document.hiddenRelationIds);
  const knownTables = new Set(schema.tables.map((table) => table.id));
  const resolved: DiagramRelation[] = [];

  const applyOverride = (relation: DiagramRelation): DiagramRelation => {
    const override = document.relationOverrides[relation.id];

    if (!override) {
      return relation;
    }

    return {
      ...relation,
      sourceColumns: override.sourceColumns ?? relation.sourceColumns,
      targetColumns: override.targetColumns ?? relation.targetColumns,
      cardinality: override.cardinality ?? relation.cardinality,
      label: override.label,
    };
  };

  for (const relation of schema.relations) {
    if (hidden.has(relation.id)) {
      continue;
    }

    resolved.push(applyOverride({ ...relation }));
  }

  for (const manual of document.manualRelations) {
    if (hidden.has(manual.id)) {
      continue;
    }

    if (!knownTables.has(manual.sourceTable) || !knownTables.has(manual.targetTable)) {
      continue;
    }

    resolved.push(
      applyOverride({
        id: manual.id,
        name: manual.name,
        sourceTable: manual.sourceTable,
        sourceColumns: manual.sourceColumns,
        targetTable: manual.targetTable,
        targetColumns: manual.targetColumns,
        cardinality: manual.cardinality,
        origin: "manual",
      }),
    );
  }

  return resolved;
}
