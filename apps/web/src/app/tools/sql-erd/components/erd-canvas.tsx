"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { DiagramRelation, NodePosition, ParsedTable } from "@/tools/sql-erd";

import { buildEdges, buildNodes, parseHandleId } from "../lib/erd-graph";
import type { ErdSelection, RelationPatch, TableNode } from "../sql-erd.types";
import ErdRelationEdge from "./erd-relation-edge";
import ErdTableNode from "./erd-table-node";

const nodeTypes = { erdTable: ErdTableNode };
const edgeTypes = { erdRelation: ErdRelationEdge };
const DELETE_KEYS = ["Backspace", "Delete"];

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
  const { fitView, setCenter } = useReactFlow();
  // Positions of nodes mid-drag; committed to the document on drag stop.
  const [dragPositions, setDragPositions] = useState<Record<string, NodePosition>>({});
  // React Flow owns selection while the pointer is on the canvas (click or marquee).
  const [selectedNodeIds, setSelectedNodeIds] = useState<ReadonlySet<string>>(new Set());

  const collapsedSet = useMemo(() => new Set(collapsedTableIds), [collapsedTableIds]);

  // Edges follow the live positions so they swap sides mid-drag.
  const livePositions = useMemo(
    () => ({ ...positions, ...dragPositions }),
    [positions, dragPositions],
  );

  const nodes = useMemo(
    () =>
      buildNodes({
        tables,
        relations,
        positions: livePositions,
        collapsedTableIds: collapsedSet,
        accentByFileId,
        nameByFileId,
        selection,
        selectedNodeIds,
      }),
    [
      tables,
      relations,
      livePositions,
      collapsedSet,
      accentByFileId,
      nameByFileId,
      selection,
      selectedNodeIds,
    ],
  );

  const edges = useMemo(
    () => buildEdges({ relations, positions: livePositions, selection }),
    [relations, livePositions, selection],
  );

  useEffect(() => {
    if (!fitViewSignal) {
      return;
    }

    const timer = window.setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 40);

    return () => window.clearTimeout(timer);
  }, [fitViewSignal, fitView]);

  useEffect(() => {
    if (!focusRequest) {
      return;
    }

    const target = positions[focusRequest.tableId];

    if (!target) {
      return;
    }

    setCenter(target.x + 130, target.y + 90, { zoom: 1, duration: 400 });
  }, [focusRequest, positions, setCenter]);

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

    setSelectedNodeIds((current) => {
      const next = new Set(current);

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

      return next;
    });
  }, []);

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
      onNodeClick={(_event, node) => onSelectionChange({ kind: "table", id: node.id })}
      onNodeDoubleClick={(_event, node) => onToggleCollapsed(node.id)}
      onEdgeClick={(_event, edge) => onSelectionChange({ kind: "relation", id: edge.id })}
      onPaneClick={() => onSelectionChange({ kind: "none" })}
      onConnect={handleConnect}
      onReconnect={handleReconnect}
      connectionMode={ConnectionMode.Loose}
      connectionRadius={32}
      deleteKeyCode={DELETE_KEYS}
      nodesDraggable
      nodesConnectable
      elevateEdgesOnSelect
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
