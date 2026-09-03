export const ERD_DOCUMENT_STORAGE_KEY = "sql-erd:document:v1";

/** Files are held entirely in localStorage, so keep the workspace within its quota. */
export const MAX_FILES = 40;
export const MAX_FILE_BYTES = 1_000_000;

/** Re-parsing every keystroke is wasteful on large schemas; this feels instant anyway. */
export const PARSE_DEBOUNCE_MS = 250;

export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 460;
export const DEFAULT_SIDEBAR_WIDTH = 280;

export const MIN_EDITOR_HEIGHT = 120;
export const MAX_EDITOR_HEIGHT = 560;
export const DEFAULT_EDITOR_HEIGHT = 240;

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
