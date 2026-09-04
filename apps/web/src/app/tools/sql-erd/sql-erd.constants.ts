export const ERD_DOCUMENT_STORAGE_KEY = "sql-erd:document:v1";

/** Files are held entirely in localStorage, so keep the workspace within its quota. */
export const MAX_FILES = 40;
export const MAX_FILE_BYTES = 1_000_000;

/** Re-parsing every keystroke is wasteful on large schemas; this feels instant anyway. */
export const PARSE_DEBOUNCE_MS = 250;

export const MIN_FILE_TREE_WIDTH = 180;
export const MAX_FILE_TREE_WIDTH = 400;
export const DEFAULT_FILE_TREE_WIDTH = 240;

export const MIN_EDITOR_WIDTH = 260;
export const MAX_EDITOR_WIDTH = 900;
export const DEFAULT_EDITOR_WIDTH = 420;

/** Width of a pane collapsed down to its vertical label rail. */
export const RAIL_WIDTH = 34;

/** Header accents, assigned to files in order so each file's tables read as a group. */
export const FILE_ACCENTS: readonly string[] = [
  "#0EA5C9",
  "#EC4899",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#6366F1",
  "#EF4444",
  "#14B8A6",
];

export function accentForIndex(index: number): string {
  return FILE_ACCENTS[index % FILE_ACCENTS.length];
}

export const SQL_FILE_EXTENSIONS = [".sql", ".ddl", ".txt"] as const;
