"use client";

import "@xyflow/react/dist/style.css";
import "./styles.css";

import { ReactFlowProvider } from "@xyflow/react";
import Link from "next/link";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import {
  computeLayout,
  parseDocumentJson,
  parseSqlFiles,
  placeMissingTables,
  resolveRelations,
  SAMPLE_SQL_FILES,
  serializeDocument,
  serializeSql,
  type DiagramRelation,
  type NodePosition,
  type ParsedTable,
  type SqlFile,
} from "@/tools/sql-erd";

import ErdCanvas from "./components/erd-canvas";
import ErdFileExplorer from "./components/erd-file-explorer";
import ErdInspector from "./components/erd-inspector";
import ErdSqlEditor from "./components/erd-sql-editor";
import ErdToolbar from "./components/erd-toolbar";
import PaneRail from "./components/pane-rail";
import { useErdDocument } from "./hooks/use-erd-document";
import { useResizable } from "./hooks/use-resizable";
import { downloadTextFile, readFileAsText } from "./lib/download";
import {
  loadEditorCollapsed,
  loadEditorWidth,
  loadFileTreeCollapsed,
  loadFileTreeWidth,
  saveEditorCollapsed,
  saveEditorWidth,
  saveFileTreeCollapsed,
  saveFileTreeWidth,
} from "./lib/erd-persistence";
import {
  accentForIndex,
  DEFAULT_EDITOR_WIDTH,
  DEFAULT_FILE_TREE_WIDTH,
  MAX_EDITOR_WIDTH,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_FILE_TREE_WIDTH,
  MIN_EDITOR_WIDTH,
  MIN_FILE_TREE_WIDTH,
  PARSE_DEBOUNCE_MS,
  SQL_FILE_EXTENSIONS,
} from "./sql-erd.constants";
import type { ErdSelection, RelationPatch } from "./sql-erd.types";

export default function SqlErdClient() {
  const {
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
  } = useErdDocument();

  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [selection, setSelection] = useState<ErdSelection>({ kind: "none" });
  const [focusRequest, setFocusRequest] = useState<{ tableId: string; nonce: number } | null>(null);
  const [fitViewSignal, setFitViewSignal] = useState(0);
  const [fileTreeCollapsed, setFileTreeCollapsed] = useState(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [debouncedFiles, setDebouncedFiles] = useState<SqlFile[]>([]);

  const fileTree = useResizable({
    axis: "horizontal",
    min: MIN_FILE_TREE_WIDTH,
    max: MAX_FILE_TREE_WIDTH,
    initial: DEFAULT_FILE_TREE_WIDTH,
    onCommit: saveFileTreeWidth,
  });
  const editor = useResizable({
    axis: "horizontal",
    min: MIN_EDITOR_WIDTH,
    max: MAX_EDITOR_WIDTH,
    initial: DEFAULT_EDITOR_WIDTH,
    onCommit: saveEditorWidth,
  });

  const setFileTreeSize = fileTree.setSize;
  const setEditorSize = editor.setSize;

  useEffect(() => {
    const storedFileTreeWidth = loadFileTreeWidth();
    const storedEditorWidth = loadEditorWidth();
    const storedFileTreeCollapsed = loadFileTreeCollapsed();
    const storedEditorCollapsed = loadEditorCollapsed();

    startTransition(() => {
      setFileTreeSize(storedFileTreeWidth);
      setEditorSize(storedEditorWidth);
      setFileTreeCollapsed(storedFileTreeCollapsed);
      setEditorCollapsed(storedEditorCollapsed);
    });
  }, [setFileTreeSize, setEditorSize]);

  const toggleFileTreeCollapsed = useCallback(() => {
    setFileTreeCollapsed((current) => {
      saveFileTreeCollapsed(!current);
      return !current;
    });
  }, []);

  const toggleEditorCollapsed = useCallback(() => {
    setEditorCollapsed((current) => {
      saveEditorCollapsed(!current);
      return !current;
    });
  }, []);

  // Parsing on every keystroke is wasted work on a large schema.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedFiles(erdDocument.files), PARSE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [erdDocument.files]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => setStatusMessage(null), 6000);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const schema = useMemo(
    () =>
      parseSqlFiles(
        debouncedFiles.filter((file) => file.enabled).map((file) => ({ id: file.id, sql: file.sql })),
      ),
    [debouncedFiles],
  );

  const relations = useMemo(() => resolveRelations(schema, erdDocument), [schema, erdDocument]);

  const relationsById = useMemo(() => {
    const map = new Map<string, DiagramRelation>();

    for (const relation of relations) {
      map.set(relation.id, relation);
    }

    return map;
  }, [relations]);

  const accentByFileId = useMemo(() => {
    const accents: Record<string, string> = {};

    erdDocument.files.forEach((file, index) => {
      accents[file.id] = accentForIndex(index);
    });

    return accents;
  }, [erdDocument.files]);

  const nameByFileId = useMemo(() => {
    const names: Record<string, string> = {};

    for (const file of erdDocument.files) {
      names[file.id] = file.name;
    }

    return names;
  }, [erdDocument.files]);

  const tablesByFileId = useMemo(() => {
    const grouped: Record<string, ParsedTable[]> = {};

    for (const table of schema.tables) {
      (grouped[table.fileId] ??= []).push(table);
    }

    return grouped;
  }, [schema.tables]);

  const collapsedSet = useMemo(
    () => new Set(erdDocument.collapsedTableIds),
    [erdDocument.collapsedTableIds],
  );

  // New tables land next to what is already on the canvas instead of stacking at the origin.
  useEffect(() => {
    if (!hydrated || !schema.tables.length) {
      return;
    }

    const missing = schema.tables.filter((table) => !erdDocument.positions[table.id]);

    if (!missing.length) {
      return;
    }

    const next = placeMissingTables(
      schema.tables,
      relations,
      erdDocument.positions,
      collapsedSet,
    );
    const additions: Record<string, NodePosition> = {};

    for (const table of missing) {
      const position = next[table.id];

      if (position) {
        additions[table.id] = position;
      }
    }

    mergePositions(additions);
    setFitViewSignal((current) => current + 1);
  }, [hydrated, schema.tables, relations, erdDocument.positions, collapsedSet, mergePositions]);

  const activeFile = erdDocument.files.find((file) => file.id === activeFileId) ?? null;

  useEffect(() => {
    if (!activeFileId && erdDocument.files.length) {
      setActiveFileId(erdDocument.files[0].id);
    }
  }, [activeFileId, erdDocument.files]);

  const handleUploadFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) {
        return;
      }

      const accepted = [...fileList].filter((file) =>
        SQL_FILE_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension)),
      );

      if (!accepted.length) {
        setStatusMessage("No .sql files in that drop.");
        return;
      }

      if (erdDocument.files.length + accepted.length > MAX_FILES) {
        setStatusMessage(`This workspace holds at most ${MAX_FILES} files.`);
        return;
      }

      const oversized = accepted.filter((file) => file.size > MAX_FILE_BYTES);

      if (oversized.length) {
        setStatusMessage(`${oversized[0].name} is larger than 1 MB.`);
        return;
      }

      try {
        const contents = await Promise.all(
          accepted.map(async (file) => ({ name: file.name, sql: await readFileAsText(file) })),
        );
        const ids = addFiles(contents);

        if (ids.length) {
          setActiveFileId(ids[0]);
        }

        setStatusMessage(`Imported ${contents.length} file${contents.length === 1 ? "" : "s"}.`);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not read those files.");
      }
    },
    [addFiles, erdDocument.files.length],
  );

  const handleImportJson = useCallback(
    async (file: File) => {
      try {
        const raw = await readFileAsText(file);
        const result = parseDocumentJson(raw);

        if (!result.document) {
          setStatusMessage(result.error ?? "That file is not a valid diagram export.");
          return;
        }

        replaceDocument(result.document);
        setActiveFileId(result.document.files[0]?.id ?? null);
        setSelection({ kind: "none" });
        setFitViewSignal((current) => current + 1);
        setStatusMessage(`Loaded ${result.document.files.length} file(s) from ${file.name}.`);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Could not read that file.");
      }
    },
    [replaceDocument],
  );

  const handleLoadSample = useCallback(() => {
    const ids = addFiles(SAMPLE_SQL_FILES.map((file) => ({ name: file.name, sql: file.sql })));

    if (ids.length) {
      setActiveFileId(ids[0]);
    }

    setStatusMessage("Loaded the sample schema.");
  }, [addFiles]);

  const handleClear = useCallback(() => {
    clearAll();
    setActiveFileId(null);
    setSelection({ kind: "none" });
    setStatusMessage("Workspace cleared.");
  }, [clearAll]);

  const handleAutoLayout = useCallback(() => {
    setPositions(computeLayout(schema.tables, relations, collapsedSet));
    setFitViewSignal((current) => current + 1);
  }, [collapsedSet, relations, schema.tables, setPositions]);

  const handleCreateRelation = useCallback(
    (patch: RelationPatch) => {
      if (!patch.sourceTable || !patch.targetTable) {
        return;
      }

      const id = addManualRelation({
        sourceTable: patch.sourceTable,
        targetTable: patch.targetTable,
        sourceColumns: patch.sourceColumns,
        targetColumns: patch.targetColumns,
      });

      setSelection({ kind: "relation", id });
    },
    [addManualRelation],
  );

  const handleUpdateRelationById = useCallback(
    (relationId: string, patch: RelationPatch) => {
      const relation = relationsById.get(relationId);

      if (relation) {
        updateRelation(relation, patch);
      }
    },
    [relationsById, updateRelation],
  );

  const handleDeleteRelationById = useCallback(
    (relationId: string) => {
      const relation = relationsById.get(relationId);

      if (relation) {
        deleteRelation(relation);
        setSelection({ kind: "none" });
      }
    },
    [deleteRelation, relationsById],
  );

  const handleSelectTable = useCallback((tableId: string) => {
    setSelection({ kind: "table", id: tableId });
    setFocusRequest({ tableId, nonce: Date.now() });
  }, []);

  const issuesForActiveFile = useMemo(
    () => schema.issues.filter((issue) => issue.fileId === activeFileId),
    [activeFileId, schema.issues],
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-page text-body">
      <header className="flex items-center gap-3 border-b border-border bg-page px-4 py-2">
        <Link
          href="/tools"
          className="font-mono text-[12px] text-muted transition-colors hover:text-heading"
        >
          ← Tools
        </Link>
        <h1 className="font-mono text-[13px] font-semibold text-heading">SQL ERD Visualizer</h1>
        <p className="hidden truncate font-mono text-[11px] text-muted md:block">
          PostgreSQL DDL in, diagram out · drag between columns to add a relationship · everything
          is saved in this browser
        </p>
        {storageBlocked ? (
          <span className="ml-auto shrink-0 font-mono text-[11px] text-muted">
            ⚠ Browser storage is unavailable — changes will not persist.
          </span>
        ) : null}
      </header>

      <ErdToolbar
        tableCount={schema.tables.length}
        relationCount={relations.length}
        hiddenRelationCount={erdDocument.hiddenRelationIds.length}
        onImportJson={handleImportJson}
        onExportJson={() =>
          downloadTextFile("sql-erd-diagram.json", serializeDocument(erdDocument), "application/json")
        }
        onExportSql={() =>
          downloadTextFile("schema.sql", serializeSql(erdDocument.files), "application/sql")
        }
        onAutoLayout={handleAutoLayout}
        onFitView={() => setFitViewSignal((current) => current + 1)}
        onRestoreHidden={restoreHiddenRelations}
        onLoadSample={handleLoadSample}
        onClear={handleClear}
      />

      {statusMessage ? (
        <div className="border-b border-border bg-accent/10 px-4 py-1 font-mono text-[11px] text-heading">
          {statusMessage}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {fileTreeCollapsed ? (
          <PaneRail
            label="Files"
            badge={erdDocument.files.length ? String(erdDocument.files.length) : undefined}
            onExpand={toggleFileTreeCollapsed}
          />
        ) : (
          <>
            <div style={{ width: fileTree.size }} className="shrink-0">
              <ErdFileExplorer
                files={erdDocument.files}
                accentByFileId={accentByFileId}
                tablesByFileId={tablesByFileId}
                activeFileId={activeFileId}
                selection={selection}
                onSelectFile={setActiveFileId}
                onAddFile={() => {
                  const [id] = addFiles([
                    { name: `untitled-${erdDocument.files.length + 1}.sql`, sql: "" },
                  ]);
                  setActiveFileId(id ?? null);
                }}
                onUploadFiles={handleUploadFiles}
                onToggleFile={toggleFile}
                onRemoveFile={removeFile}
                onRenameFile={renameFile}
                onSelectTable={handleSelectTable}
                onLoadSample={handleLoadSample}
                onCollapse={toggleFileTreeCollapsed}
              />
            </div>

            <div
              className="w-1 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-accent/40"
              onPointerDown={fileTree.startResize}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize the file explorer"
            />
          </>
        )}

        {editorCollapsed ? (
          <PaneRail label="SQL" onExpand={toggleEditorCollapsed} />
        ) : (
          <>
            <div style={{ width: editor.size }} className="min-w-0 shrink-0">
              <ErdSqlEditor
                file={activeFile}
                issues={issuesForActiveFile}
                tables={schema.tables}
                tableCount={(tablesByFileId[activeFileId ?? ""] ?? []).length}
                onCollapse={toggleEditorCollapsed}
                onChange={(sql) => {
                  if (activeFileId) {
                    updateFileSql(activeFileId, sql);
                  }
                }}
              />
            </div>

            <div
              className="w-1 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-accent/40"
              onPointerDown={editor.startResize}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize the SQL editor"
            />
          </>
        )}

        <div className="relative min-w-0 flex-1">
          <ReactFlowProvider>
            <ErdCanvas
              tables={schema.tables}
              relations={relations}
              positions={erdDocument.positions}
              collapsedTableIds={erdDocument.collapsedTableIds}
              accentByFileId={accentByFileId}
              nameByFileId={nameByFileId}
              selection={selection}
              focusRequest={focusRequest}
              fitViewSignal={fitViewSignal}
              onSelectionChange={setSelection}
              onPositionsChange={mergePositions}
              onToggleCollapsed={toggleCollapsed}
              onCreateRelation={handleCreateRelation}
              onReconnectRelation={handleUpdateRelationById}
              onDeleteRelation={handleDeleteRelationById}
            />
          </ReactFlowProvider>

          {schema.tables.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-sm">
                <p className="mb-1 font-mono text-[13px] font-semibold text-heading">
                  Nothing to draw yet
                </p>
                <p className="mb-4 text-[12px] leading-relaxed text-body">
                  Add a SQL file in the explorer and type or paste PostgreSQL{" "}
                  <code>CREATE TABLE</code> statements. Tables, columns, indexes and foreign keys
                  appear as you type.
                </p>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="rounded-md bg-accent px-3 py-1.5 font-mono text-[12px] font-semibold text-accent-text transition-colors hover:bg-accent-hover"
                >
                  Load sample schema
                </button>
              </div>
            </div>
          ) : null}

          {/* Floated rather than docked so the diagram keeps the full width of its pane. */}
          <div className="pointer-events-none absolute right-3 top-3 flex max-h-[calc(100%-190px)] justify-end">
            <ErdInspector
              selection={selection}
              tables={schema.tables}
              relations={relations}
              onSelect={setSelection}
              onUpdateRelation={updateRelation}
              onDeleteRelation={(relation) => {
                deleteRelation(relation);
                setSelection({ kind: "none" });
              }}
              onToggleCollapsed={toggleCollapsed}
              onClose={() => setSelection({ kind: "none" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
