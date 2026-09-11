"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  PanOnScrollMode,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { NODE_WIDTH, type DiagramRelation, type NodePosition, type ParsedTable } from "@/tools/sql-erd";

import { buildEdges, buildNodes, parseHandleId } from "../lib/erd-graph";
import { selectionKey, type ErdSelection, type RelationPatch, type TableNode } from "../sql-erd.types";
import ErdRelationEdge from "./erd-relation-edge";
import ErdTableNode from "./erd-table-node";

const nodeTypes = { erdTable: ErdTableNode };
const edgeTypes = { erdRelation: ErdRelationEdge };
const DELETE_KEYS = ["Backspace", "Delete"];
const NO_SELECTION: ReadonlySet<string> = new Set();

export interface ErdCanvasProps {
  tables: ParsedTable[];
  relations: DiagramRelation[];
  positions: Record<string, NodePosition>;
  collapsedTableIds: string[];
  accentByFileId: Record<string, string>;
  nameByFileId: Record<string, string>;
  selection: ErdSelection;
  focusRequest: { tableId: string; nonce: number } | null;
  fitViewSignal: number;
  onSelectionChange: (selection: ErdSelection) => void;
  onPositionsChange: (positions: Record<string, NodePosition>) => void;
  onToggleCollapsed: (tableId: string) => void;
  onCreateRelation: (patch: RelationPatch) => void;
  onReconnectRelation: (relationId: string, patch: RelationPatch) => void;
  onDeleteRelation: (relationId: string) => void;
}

export default function ErdCanvas({
  tables,
  relations,
  positions,
  collapsedTableIds,
  accentByFileId,
  nameByFileId,
  selection,
  focusRequest,
  fitViewSignal,
  onSelectionChange,
  onPositionsChange,
  onToggleCollapsed,
  onCreateRelation,
  onReconnectRelation,
  onDeleteRelation,
}: ErdCanvasProps) {
  const { fitView, getNode, setCenter } = useReactFlow();
  // Positions of nodes mid-drag; committed to the document on drag stop.
  const [dragPositions, setDragPositions] = useState<Record<string, NodePosition>>({});

  // Multi-selection is tagged with the selection it was made against. Anything that
  // changes the selection from outside the canvas — the file tree, the inspector —
  // leaves a stale key, which collapses the canvas back to that one table.
  const [multiSelection, setMultiSelection] = useState<{
    key: string;
    ids: ReadonlySet<string>;
  }>({ key: "none", ids: NO_SELECTION });

  const currentSelectionKey = selectionKey(selection);
  const selectedNodeIds =
    multiSelection.key === currentSelectionKey ? multiSelection.ids : NO_SELECTION;

  const collapsedSet = useMemo(() => new Set(collapsedTableIds), [collapsedTableIds]);

  const baseNodes = useMemo(
    () =>
      buildNodes({
        tables,
        relations,
        positions,
        collapsedTableIds: collapsedSet,
        accentByFileId,
        nameByFileId,
        selection,
        selectedNodeIds,
      }),
    [
      tables,
      relations,
      positions,
      collapsedSet,
      accentByFileId,
      nameByFileId,
      selection,
      selectedNodeIds,
    ],
  );

  // Only the nodes actually being dragged get a new object, so every other node
  // keeps its identity and skips re-rendering for the length of the drag.
  const nodes = useMemo(() => {
    if (!Object.keys(dragPositions).length) {
      return baseNodes;
    }

    return baseNodes.map((node) =>
      dragPositions[node.id] ? { ...node, position: dragPositions[node.id] } : node,
    );
  }, [baseNodes, dragPositions]);

  // Deliberately keyed to the committed positions, not the live drag ones: React Flow
  // derives edge geometry from the node store, so rebuilding this array mid-drag only
  // churns edge elements and flips handle sides as nodes cross, which reads as flicker.
  const edges = useMemo(
    () => buildEdges({ relations, positions, selection }),
    [relations, positions, selection],
  );

  useEffect(() => {
    if (!fitViewSignal) {
      return;
    }

    const timer = window.setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 40);

    return () => window.clearTimeout(timer);
  }, [fitViewSignal, fitView]);

  // Centring is a one-shot: without the nonce guard, and with `positions` as a
  // dependency, every later document change re-ran it and yanked the view back.
  const handledFocusNonce = useRef<number | null>(null);

  useEffect(() => {
    if (!focusRequest || handledFocusNonce.current === focusRequest.nonce) {
      return;
    }

    handledFocusNonce.current = focusRequest.nonce;

    const node = getNode(focusRequest.tableId);

    if (!node) {
      return;
    }

    setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + (node.height ?? 0) / 2, {
      zoom: 1,
      duration: 400,
    });
  }, [focusRequest, getNode, setCenter]);

  const handleNodesChange = useCallback((changes: NodeChange<TableNode>[]) => {
    const moved: Record<string, NodePosition> = {};
    let hasMoved = false;
    let hasSelection = false;

    for (const change of changes) {
      if (change.type === "position" && change.position) {
        moved[change.id] = change.position;
        hasMoved = true;
      }

      if (change.type === "select") {
        hasSelection = true;
      }
    }

    if (hasMoved) {
      setDragPositions((current) => ({ ...current, ...moved }));
    }

    if (!hasSelection) {
      return;
    }

    // Marquee selection: fold the changes into whatever is selected right now.
    setMultiSelection((current) => {
      const next = new Set(current.key === currentSelectionKey ? current.ids : NO_SELECTION);

      for (const change of changes) {
        if (change.type !== "select") {
          continue;
        }

        if (change.selected) {
          next.add(change.id);
        } else {
          next.delete(change.id);
        }
      }

      return { key: currentSelectionKey, ids: next };
    });
  }, [currentSelectionKey]);

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      for (const change of changes) {
        if (change.type === "remove") {
          onDeleteRelation(change.id);
        }
      }
    },
    [onDeleteRelation],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const sourceColumn = parseHandleId(connection.sourceHandle);
      const targetColumn = parseHandleId(connection.targetHandle);

      if (!connection.source || !connection.target) {
        return;
      }

      onCreateRelation({
        sourceTable: connection.source,
        sourceColumns: sourceColumn ? [sourceColumn] : [],
        targetTable: connection.target,
        targetColumns: targetColumn ? [targetColumn] : [],
      });
    },
    [onCreateRelation],
  );

  const handleReconnect = useCallback(
    (oldEdge: Edge, connection: Connection) => {
      const sourceColumn = parseHandleId(connection.sourceHandle);
      const targetColumn = parseHandleId(connection.targetHandle);

      onReconnectRelation(oldEdge.id, {
        sourceTable: connection.source,
        sourceColumns: sourceColumn ? [sourceColumn] : [],
        targetTable: connection.target,
        targetColumns: targetColumn ? [targetColumn] : [],
      });
    },
    [onReconnectRelation],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onNodeDragStop={(_event, _node, draggedNodes) => {
        // A drag started on a selected node moves the whole selection with it.
        const committed: Record<string, NodePosition> = {};

        for (const dragged of draggedNodes) {
          committed[dragged.id] = dragged.position;
        }

        setDragPositions((current) => {
          const next = { ...current };

          for (const id of Object.keys(committed)) {
            delete next[id];
          }

          return next;
        });
        onPositionsChange(committed);
      }}
      onNodeClick={(event, node) => {
        // Resolved here rather than through React Flow's own selection so the
        // behaviour is the same on every platform and cannot be thrown off by a
        // modifier key whose keyup was swallowed by a window switch.
        if (event.metaKey || event.ctrlKey) {
          const ids = new Set(selectedNodeIds);

          if (ids.has(node.id)) {
            ids.delete(node.id);
          } else {
            ids.add(node.id);
          }

          const nextSelection: ErdSelection = ids.has(node.id)
            ? { kind: "table", id: node.id }
            : { kind: "none" };

          setMultiSelection({ key: selectionKey(nextSelection), ids });
          onSelectionChange(nextSelection);
          return;
        }

        const row = (event.target as HTMLElement | null)?.closest?.("[data-erd-column]");
        const columnName = row?.getAttribute("data-erd-column");
        const nextSelection: ErdSelection = columnName
          ? { kind: "column", tableId: node.id, columnName }
          : { kind: "table", id: node.id };

        // A plain click replaces the selection outright.
        setMultiSelection({ key: selectionKey(nextSelection), ids: new Set([node.id]) });
        onSelectionChange(nextSelection);
      }}
      onNodeDoubleClick={(_event, node) => onToggleCollapsed(node.id)}
      onEdgeClick={(_event, edge) => onSelectionChange({ kind: "relation", id: edge.id })}
      onPaneClick={() => {
        setMultiSelection({ key: "none", ids: NO_SELECTION });
        onSelectionChange({ kind: "none" });
      }}
      onConnect={handleConnect}
      onReconnect={handleReconnect}
      connectionMode={ConnectionMode.Loose}
      connectionRadius={32}
      deleteKeyCode={DELETE_KEYS}
      // Scrolling moves the camera on both axes; depth is reserved for
      // Cmd/Ctrl + scroll and trackpad pinch, which React Flow routes through
      // the zoom activation key rather than the plain wheel handler.
      panOnScroll
      panOnScrollMode={PanOnScrollMode.Free}
      zoomOnScroll={false}
      zoomOnPinch
      nodesDraggable
      nodesConnectable
      minZoom={0.1}
      maxZoom={2}
      proOptions={{ hideAttribution: false }}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      className="erd-flow"
    >
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(node) => (node.data as TableNode["data"]).accent}
        nodeStrokeWidth={2}
        className="erd-minimap"
      />
    </ReactFlow>
  );
}
