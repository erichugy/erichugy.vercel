import { erdDocumentSchema, type ErdDocument, type SqlFile } from "./types";

const DOCUMENT_VERSION = 1;

/** Files are addressed by id, so ids must survive rename and reorder. */
function createFileId(): string {
  return `file_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createEmptyDocument(): ErdDocument {
  return {
    version: DOCUMENT_VERSION,
    files: [],
    positions: {},
    manualRelations: [],
    hiddenRelationIds: [],
    relationOverrides: {},
    collapsedTableIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function createSqlFile(name: string, sql: string): SqlFile {
  return { id: createFileId(), name, sql, enabled: true };
}

export interface DocumentParseResult {
  document?: ErdDocument;
  error?: string;
}

/** Validates an imported diagram JSON payload before it is allowed into state. */
export function parseDocumentJson(raw: string): DocumentParseResult {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return { error: "That file is not valid JSON." };
  }

  const result = erdDocumentSchema.safeParse(value);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "That file is not a valid diagram export." };
  }

  return { document: result.data };
}

export function serializeDocument(document: ErdDocument): string {
  return JSON.stringify({ ...document, updatedAt: new Date().toISOString() }, null, 2);
}

/** Concatenates every enabled file into a single script, one header per file. */
export function serializeSql(files: SqlFile[]): string {
  return files
    .filter((file) => file.enabled)
    .map((file) => `-- ${file.name}\n${file.sql.trim()}`)
    .join("\n\n");
}
