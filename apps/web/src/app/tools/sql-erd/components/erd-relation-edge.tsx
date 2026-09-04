"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { memo } from "react";

import type { RelationEdgeData } from "../sql-erd.types";

function ErdRelationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<Edge<RelationEdgeData>>) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  const isManual = data?.relation.origin === "manual";

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        interactionWidth={18}
        style={{
          stroke: selected ? "var(--color-accent)" : "var(--color-muted)",
          strokeWidth: selected ? 2 : 1.25,
          strokeDasharray: isManual ? "5 3" : undefined,
        }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            className={`nodrag nopan pointer-events-none absolute rounded border px-1 font-mono text-[9px] leading-4 ${
              selected
                ? "border-accent bg-accent text-accent-text"
                : "border-border bg-card text-muted"
            }`}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default memo(ErdRelationEdge);
