"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { memo } from "react";

import { CARDINALITY_ENDPOINTS, type RelationEndMark } from "@/tools/sql-erd";

import type { RelationEdgeData } from "../sql-erd.types";

/** How far the line runs straight out of a handle before it turns. */
const STEP_OFFSET = 18;

// Crow's-foot geometry, all measured outward from the node edge. The mark sits
// against the node and the optional ring, when there is one, sits outboard of it.
const FOOT_LENGTH = 11;
const FOOT_SPREAD = 5.5;
const BAR_DISTANCE = 10;
const BAR_HALF_HEIGHT = 5.5;
const RING_DISTANCE = 17;
const RING_RADIUS = 3.5;

/** Endpoints always leave a node horizontally, so only the side matters. */
function outwardFor(position: Position): number {
  return position === Position.Left ? -1 : 1;
}

interface EndpointMarkProps {
  x: number;
  y: number;
  position: Position;
  mark: RelationEndMark;
  optional: boolean;
  stroke: string;
  strokeWidth: number;
}

/**
 * Crow's-foot notation: a splayed foot for "many", a single bar for "one", plus a
 * ring for an end that may have no counterpart at all.
 */
function EndpointMark({
  x,
  y,
  position,
  mark,
  optional,
  stroke,
  strokeWidth,
}: EndpointMarkProps) {
  const outward = outwardFor(position);

  const shape =
    mark === "many"
      ? // Three prongs converging on an apex out along the line, opening onto the node.
        [
          `M${x + outward * FOOT_LENGTH} ${y}L${x} ${y - FOOT_SPREAD}`,
          `M${x + outward * FOOT_LENGTH} ${y}L${x} ${y}`,
          `M${x + outward * FOOT_LENGTH} ${y}L${x} ${y + FOOT_SPREAD}`,
        ].join("")
      : `M${x + outward * BAR_DISTANCE} ${y - BAR_HALF_HEIGHT}L${x + outward * BAR_DISTANCE} ${
          y + BAR_HALF_HEIGHT
        }`;

  return (
    <g className="erd-edge-mark" data-mark={mark} style={{ pointerEvents: "none" }}>
      <path
        d={shape}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {optional ? (
        <circle
          cx={x + outward * RING_DISTANCE}
          cy={y}
          r={RING_RADIUS}
          fill="var(--color-card)"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : null}
    </g>
  );
}

function ErdRelationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<Edge<RelationEdgeData>>) {
  // Every edge crossing the same gap would otherwise turn at the same midpoint and
  // stack into one trunk; the offset gives each its own vertical channel.
  const channelOffset = data?.channelOffset ?? 0;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
    offset: STEP_OFFSET,
    centerX: (sourceX + targetX) / 2 + channelOffset,
  });

  const relation = data?.relation;
  const isManual = relation?.origin === "manual";
  const [sourceMark, targetMark] = relation
    ? CARDINALITY_ENDPOINTS[relation.cardinality]
    : ([null, null] as const);
  const isSelected = Boolean(selected);
  const stroke = isSelected ? "var(--color-accent)" : "var(--color-muted)";
  const strokeWidth = isSelected ? 2 : 1.25;

  return (
    <>
      <BaseEdge
        path={path}
        interactionWidth={18}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray: isManual ? "5 3" : undefined,
        }}
      />

      {sourceMark ? (
        <EndpointMark
          x={sourceX}
          y={sourceY}
          position={sourcePosition}
          mark={sourceMark}
          optional={Boolean(data?.sourceOptional)}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : null}

      {targetMark ? (
        <EndpointMark
          x={targetX}
          y={targetY}
          position={targetPosition}
          mark={targetMark}
          optional={Boolean(data?.targetOptional)}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : null}

      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            className={`nodrag nopan pointer-events-none absolute rounded border px-1 font-mono text-[9px] leading-4 ${
              isSelected
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
