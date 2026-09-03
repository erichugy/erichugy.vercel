"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";

import {
  createEmptyDocument,
  createManualRelationId,
  createSqlFile,
  type DiagramRelation,
  type ErdDocument,
  type NodePosition,
} from "@/tools/sql-erd";

import { loadDocument, saveDocument } from "../lib/erd-persistence";
import { MAX_FILES } from "../sql-erd.constants";
import type { RelationPatch } from "../sql-erd.types";

const SAVE_DEBOUNCE_MS = 400;

export interface NewSqlFile {
  name: string;
  sql: string;
}

export interface UseErdDocumentResult {
  erdDocument: ErdDocument;
  hydrated: boolean;
  storageBlocked: boolean;
  addFiles: (files: NewSqlFile[]) => string[];
  updateFileSql: (fileId: string, sql: string) => void;
  renameFile: (fileId: string, name: string) => void;
  toggleFile: (fileId: string) => void;
  removeFile: (fileId: string) => void;
  replaceDocument: (next: ErdDocument) => void;
  clearAll: () => void;
  setPositions: (positions: Record<string, NodePosition>) => void;
  mergePositions: (positions: Record<string, NodePosition>) => void;
  toggleCollapsed: (tableId: string) => void;
  addManualRelation: (patch: Required<Pick<RelationPatch, "sourceTable" | "targetTable">> & RelationPatch) => string;
  updateRelation: (relation: DiagramRelation, patch: RelationPatch) => void;
  deleteRelation: (relation: DiagramRelation) => void;
  restoreHiddenRelations: () => void;
}

export function useErdDocument(): UseErdDocumentResult {
  const [erdDocument, setErdDocument] = useState<ErdDocument>(createEmptyDocument);
  const [hydrated, setHydrated] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const stored = loadDocument();

    startTransition(() => {
      setErdDocument(stored);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const saved = saveDocument(erdDocument);

      startTransition(() => setStorageBlocked(!saved));
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(saveTimer.current);
  }, [erdDocument, hydrated]);

  const patchDocument = useCallback((updater: (current: ErdDocument) => ErdDocument) => {
    setErdDocument((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }));
  }, []);

  const addFiles = useCallback(
    (files: NewSqlFile[]) => {
      const created = files.map((file) => createSqlFile(file.name, file.sql));

      patchDocument((current) => ({
        ...current,
        files: [...current.files, ...created].slice(0, MAX_FILES),
      }));

      return created.map((file) => file.id);
    },
    [patchDocument],
  );

  const updateFileSql = useCallback(
    (fileId: string, sql: string) => {
      patchDocument((current) => ({
        ...current,
        files: current.files.map((file) => (file.id === fileId ? { ...file, sql } : file)),
      }));
    },
    [patchDocument],
  );

  const renameFile = useCallback(
    (fileId: string, name: string) => {
      const trimmed = name.trim();

      if (!trimmed) {
        return;
      }

      patchDocument((current) => ({
        ...current,
        files: current.files.map((file) => (file.id === fileId ? { ...file, name: trimmed } : file)),
      }));
    },
    [patchDocument],
  );

  const toggleFile = useCallback(
    (fileId: string) => {
      patchDocument((current) => ({
        ...current,
        files: current.files.map((file) =>
          file.id === fileId ? { ...file, enabled: !file.enabled } : file,
        ),
      }));
    },
    [patchDocument],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      patchDocument((current) => ({
        ...current,
        files: current.files.filter((file) => file.id !== fileId),
      }));
    },
    [patchDocument],
  );

  const replaceDocument = useCallback(
    (next: ErdDocument) => {
      patchDocument(() => next);
    },
    [patchDocument],
  );

  const clearAll = useCallback(() => {
    patchDocument(() => createEmptyDocument());
  }, [patchDocument]);

  const setPositions = useCallback(
    (positions: Record<string, NodePosition>) => {
      patchDocument((current) => ({ ...current, positions }));
    },
    [patchDocument],
  );

  const mergePositions = useCallback(
    (positions: Record<string, NodePosition>) => {
      patchDocument((current) => ({ ...current, positions: { ...current.positions, ...positions } }));
    },
    [patchDocument],
  );

  const toggleCollapsed = useCallback(
    (tableId: string) => {
      patchDocument((current) => ({
        ...current,
        collapsedTableIds: current.collapsedTableIds.includes(tableId)
          ? current.collapsedTableIds.filter((id) => id !== tableId)
          : [...current.collapsedTableIds, tableId],
      }));
    },
    [patchDocument],
  );

  const addManualRelation = useCallback(
    (patch: Required<Pick<RelationPatch, "sourceTable" | "targetTable">> & RelationPatch) => {
      const id = createManualRelationId();

      patchDocument((current) => ({
        ...current,
        manualRelations: [
          ...current.manualRelations,
          {
            id,
            sourceTable: patch.sourceTable,
            sourceColumns: patch.sourceColumns ?? [],
            targetTable: patch.targetTable,
            targetColumns: patch.targetColumns ?? [],
            cardinality: patch.cardinality ?? "many-to-one",
          },
        ],
        relationOverrides: patch.label
          ? { ...current.relationOverrides, [id]: { label: patch.label } }
          : current.relationOverrides,
      }));

      return id;
    },
    [patchDocument],
  );

  const updateRelation = useCallback(
    (relation: DiagramRelation, patch: RelationPatch) => {
      const changesEndpoints =
        (patch.sourceTable !== undefined && patch.sourceTable !== relation.sourceTable) ||
        (patch.targetTable !== undefined && patch.targetTable !== relation.targetTable) ||
        patch.sourceColumns !== undefined ||
        patch.targetColumns !== undefined;

      patchDocument((current) => {
        if (relation.origin === "manual") {
          return {
            ...current,
            manualRelations: current.manualRelations.map((entry) =>
              entry.id === relation.id
                ? {
                    ...entry,
                    sourceTable: patch.sourceTable ?? entry.sourceTable,
                    sourceColumns: patch.sourceColumns ?? entry.sourceColumns,
                    targetTable: patch.targetTable ?? entry.targetTable,
                    targetColumns: patch.targetColumns ?? entry.targetColumns,
                    cardinality: patch.cardinality ?? entry.cardinality,
                  }
                : entry,
            ),
            relationOverrides:
              patch.label === undefined
                ? current.relationOverrides
                : {
                    ...current.relationOverrides,
                    [relation.id]: { ...current.relationOverrides[relation.id], label: patch.label },
                  },
          };
        }

        // A derived relation whose endpoints move no longer matches the DDL, so it is
        // replaced by a manual relation and the DDL-derived one is hidden.
        if (changesEndpoints) {
          const manualId = createManualRelationId();

          return {
            ...current,
            hiddenRelationIds: current.hiddenRelationIds.includes(relation.id)
              ? current.hiddenRelationIds
              : [...current.hiddenRelationIds, relation.id],
            manualRelations: [
              ...current.manualRelations,
              {
                id: manualId,
                name: relation.name,
                sourceTable: patch.sourceTable ?? relation.sourceTable,
                sourceColumns: patch.sourceColumns ?? relation.sourceColumns,
                targetTable: patch.targetTable ?? relation.targetTable,
                targetColumns: patch.targetColumns ?? relation.targetColumns,
                cardinality: patch.cardinality ?? relation.cardinality,
              },
            ],
            relationOverrides: {
              ...current.relationOverrides,
              [manualId]: { label: patch.label ?? relation.label },
            },
          };
        }

        return {
          ...current,
          relationOverrides: {
            ...current.relationOverrides,
            [relation.id]: {
              ...current.relationOverrides[relation.id],
              cardinality: patch.cardinality ?? relation.cardinality,
              label: patch.label ?? relation.label,
            },
          },
        };
      });
    },
    [patchDocument],
  );

  const deleteRelation = useCallback(
    (relation: DiagramRelation) => {
      patchDocument((current) => {
        const relationOverrides = { ...current.relationOverrides };
        delete relationOverrides[relation.id];

        if (relation.origin === "manual") {
          return {
            ...current,
            manualRelations: current.manualRelations.filter((entry) => entry.id !== relation.id),
            relationOverrides,
          };
        }

        return {
          ...current,
          hiddenRelationIds: current.hiddenRelationIds.includes(relation.id)
            ? current.hiddenRelationIds
            : [...current.hiddenRelationIds, relation.id],
          relationOverrides,
        };
      });
    },
    [patchDocument],
  );

  const restoreHiddenRelations = useCallback(() => {
    patchDocument((current) => ({ ...current, hiddenRelationIds: [] }));
  }, [patchDocument]);

  return {
    erdDocument,
    hydrated,
    storageBlocked,
    addFiles,
    updateFileSql,
    renameFile,
    toggleFile,
    removeFile,
    replaceDocument,
    clearAll,
    setPositions,
    mergePositions,
    toggleCollapsed,
    addManualRelation,
    updateRelation,
    deleteRelation,
    restoreHiddenRelations,
  };
}
