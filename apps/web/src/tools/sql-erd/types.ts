import { z } from "zod";

// ── Parsed schema model ────────────────────────────────────────────────────
// Plain interfaces: these are produced by the parser, never validated at runtime.

export interface ParsedColumn {
  name: string;
  /** Raw type text as written in the DDL, normalized to lowercase (e.g. "varchar(255)"). */
  type: string;
  /** Shortened type for display in a node row (e.g. "timestamptz", "enum"). */
  displayType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  hasDefault: boolean;
  isAutoIncrement: boolean;
  comment?: string;
}

export interface ParsedIndex {
  name?: string;
  columns: string[];
  unique: boolean;
}

export interface ParsedTable {
  /** Normalized `schema.name` (schema omitted when the DDL did not qualify it). */
  id: string;
  schema?: string;
  name: string;
  columns: ParsedColumn[];
  primaryKey: string[];
  indexes: ParsedIndex[];
  comment?: string;
  /** Id of the SQL file this table was declared in. */
  fileId: string;
  /** True when the table was only inferred from a foreign key to an undefined table. */
  isStub: boolean;
}

export type RelationCardinality = "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

export interface ParsedRelation {
  id: string;
  name?: string;
  sourceTable: string;
  sourceColumns: string[];
  targetTable: string;
  targetColumns: string[];
  cardinality: RelationCardinality;
  onDelete?: string;
  onUpdate?: string;
  /** Derived relations come from DDL; manual ones are drawn by the user. */
  origin: "derived" | "manual";
  fileId?: string;
}

export interface ParseIssue {
  fileId: string;
  message: string;
  line?: number;
}

export interface ParsedSchema {
  tables: ParsedTable[];
  relations: ParsedRelation[];
  issues: ParseIssue[];
}

// ── Persisted document ─────────────────────────────────────────────────────
// Validated at runtime on localStorage load and on JSON import, so Zod applies.

const sqlFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  sql: z.string(),
  /** Disabled files stay in the workspace but are excluded from the diagram. */
  enabled: z.boolean(),
});
export type SqlFile = z.infer<typeof sqlFileSchema>;

const nodePositionSchema = z.object({ x: z.number(), y: z.number() });
export type NodePosition = z.infer<typeof nodePositionSchema>;

const relationCardinalitySchema = z.enum([
  "one-to-one",
  "one-to-many",
  "many-to-one",
  "many-to-many",
]);

const manualRelationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  sourceTable: z.string(),
  sourceColumns: z.array(z.string()),
  targetTable: z.string(),
  targetColumns: z.array(z.string()),
  cardinality: relationCardinalitySchema,
});
export type ManualRelation = z.infer<typeof manualRelationSchema>;

const relationOverrideSchema = z.object({
  cardinality: relationCardinalitySchema.optional(),
  label: z.string().optional(),
  sourceColumns: z.array(z.string()).optional(),
  targetColumns: z.array(z.string()).optional(),
});
export type RelationOverride = z.infer<typeof relationOverrideSchema>;

export const erdDocumentSchema = z.object({
  version: z.literal(1),
  files: z.array(sqlFileSchema),
  positions: z.record(z.string(), nodePositionSchema),
  manualRelations: z.array(manualRelationSchema),
  /** Ids of DDL-derived relations the user deleted; kept so re-parsing respects the removal. */
  hiddenRelationIds: z.array(z.string()),
  relationOverrides: z.record(z.string(), relationOverrideSchema),
  collapsedTableIds: z.array(z.string()),
  updatedAt: z.string(),
});
export type ErdDocument = z.infer<typeof erdDocumentSchema>;
