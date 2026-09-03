import { createEmptyDocument, erdDocumentSchema, type ErdDocument } from "@/tools/sql-erd";

import {
  DEFAULT_EDITOR_HEIGHT,
  DEFAULT_SIDEBAR_WIDTH,
  ERD_DOCUMENT_STORAGE_KEY,
  MAX_EDITOR_HEIGHT,
  MAX_SIDEBAR_WIDTH,
  MIN_EDITOR_HEIGHT,
  MIN_SIDEBAR_WIDTH,
} from "../sql-erd.constants";

const SIDEBAR_WIDTH_STORAGE_KEY = "sql-erd:sidebar-width";
const EDITOR_HEIGHT_STORAGE_KEY = "sql-erd:editor-height";

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

export function loadSidebarWidth(): number {
  return loadNumber(
    SIDEBAR_WIDTH_STORAGE_KEY,
    DEFAULT_SIDEBAR_WIDTH,
    MIN_SIDEBAR_WIDTH,
    MAX_SIDEBAR_WIDTH,
  );
}

export function saveSidebarWidth(width: number): void {
  saveNumber(SIDEBAR_WIDTH_STORAGE_KEY, width);
}

export function loadEditorHeight(): number {
  return loadNumber(
    EDITOR_HEIGHT_STORAGE_KEY,
    DEFAULT_EDITOR_HEIGHT,
    MIN_EDITOR_HEIGHT,
    MAX_EDITOR_HEIGHT,
  );
}

export function saveEditorHeight(height: number): void {
  saveNumber(EDITOR_HEIGHT_STORAGE_KEY, height);
}
