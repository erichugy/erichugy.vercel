import { createEmptyDocument, erdDocumentSchema, type ErdDocument } from "@/tools/sql-erd";

import {
  DEFAULT_EDITOR_WIDTH,
  DEFAULT_FILE_TREE_WIDTH,
  ERD_DOCUMENT_STORAGE_KEY,
  MAX_EDITOR_WIDTH,
  MAX_FILE_TREE_WIDTH,
  MIN_EDITOR_WIDTH,
  MIN_FILE_TREE_WIDTH,
} from "../sql-erd.constants";

const FILE_TREE_WIDTH_STORAGE_KEY = "sql-erd:file-tree-width";
const EDITOR_WIDTH_STORAGE_KEY = "sql-erd:editor-width";
const FILE_TREE_COLLAPSED_STORAGE_KEY = "sql-erd:file-tree-collapsed";
const EDITOR_COLLAPSED_STORAGE_KEY = "sql-erd:editor-collapsed";

export function loadDocument(): ErdDocument {
  try {
    const raw = localStorage.getItem(ERD_DOCUMENT_STORAGE_KEY);

    if (raw === null) {
      return createEmptyDocument();
    }

    const result = erdDocumentSchema.safeParse(JSON.parse(raw));

    return result.success ? result.data : createEmptyDocument();
  } catch {
    return createEmptyDocument();
  }
}

export function saveDocument(document: ErdDocument): boolean {
  try {
    localStorage.setItem(ERD_DOCUMENT_STORAGE_KEY, JSON.stringify(document));
    return true;
  } catch {
    // Quota exceeded or storage disabled — the diagram still works for this session.
    return false;
  }
}

function loadNumber(key: string, fallback: number, min: number, max: number): number {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    const value = Number(raw);

    return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback;
  } catch {
    return fallback;
  }
}

function saveNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Non-critical layout preference.
  }
}

function loadFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function saveFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Non-critical layout preference.
  }
}

export function loadFileTreeWidth(): number {
  return loadNumber(
    FILE_TREE_WIDTH_STORAGE_KEY,
    DEFAULT_FILE_TREE_WIDTH,
    MIN_FILE_TREE_WIDTH,
    MAX_FILE_TREE_WIDTH,
  );
}

export function saveFileTreeWidth(width: number): void {
  saveNumber(FILE_TREE_WIDTH_STORAGE_KEY, width);
}

export function loadEditorWidth(): number {
  return loadNumber(EDITOR_WIDTH_STORAGE_KEY, DEFAULT_EDITOR_WIDTH, MIN_EDITOR_WIDTH, MAX_EDITOR_WIDTH);
}

export function saveEditorWidth(width: number): void {
  saveNumber(EDITOR_WIDTH_STORAGE_KEY, width);
}

export function loadFileTreeCollapsed(): boolean {
  return loadFlag(FILE_TREE_COLLAPSED_STORAGE_KEY);
}

export function saveFileTreeCollapsed(collapsed: boolean): void {
  saveFlag(FILE_TREE_COLLAPSED_STORAGE_KEY, collapsed);
}

export function loadEditorCollapsed(): boolean {
  return loadFlag(EDITOR_COLLAPSED_STORAGE_KEY);
}

export function saveEditorCollapsed(collapsed: boolean): void {
  saveFlag(EDITOR_COLLAPSED_STORAGE_KEY, collapsed);
}
