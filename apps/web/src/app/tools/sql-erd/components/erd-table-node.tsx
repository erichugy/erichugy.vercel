"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";

import {
  NODE_HEADER_HEIGHT,
  NODE_PADDING,
  NODE_ROW_HEIGHT,
  NODE_SECTION_HEADER_HEIGHT,
} from "@/tools/sql-erd";

import { makeHandleId } from "../lib/erd-graph";
import type { TableNode } from "../sql-erd.types";

function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Pulls the palette hue towards whichever heading colour the theme is using, so one
 * palette reads on the light card and the dark one. Measured across all twelve hues:
 * anything above ~54% drops the light theme's title under 4.5:1 on its own tint.
 */
function headingColorFor(hexColor: string): string {
  return `color-mix(in srgb, ${hexColor} 52%, var(--color-heading))`;
}

interface ColumnHandlesProps {
  columnName: string;
  hidden?: boolean;
}

/**
 * Both sides get a handle so an edge can approach a table from whichever side is
 * closer. Connection mode is loose, so each handle works as source and target.
 */
function ColumnHandles({ columnName, hidden }: ColumnHandlesProps) {
  const style = hidden ? { opacity: 0, pointerEvents: "none" as const, top: 8 } : undefined;

  return (
    <>
      <Handle
        type="source"
        position={Position.Left}
        id={makeHandleId(columnName, "left")}
        style={style}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={makeHandleId(columnName, "right")}
        style={style}
      />
    </>
  );
}

function ErdTableNode({ data, selected }: NodeProps<TableNode>) {
  const { table, accent, fileName, collapsed, connectedColumns, selectedColumn, dimmed } = data;
  // The title carries the table's colour; the tint alone is too faint to tell a dozen
  // tables apart at the zoom levels a whole schema is read at.
  const headingColor = headingColorFor(accent);
  const newColumnCount = table.columns.filter((column) => column.isNew).length;

  return (
    <div
      className={`erd-node-card h-full w-full rounded-lg border bg-card font-mono text-[11px] transition-opacity ${
        selected ? "border-accent ring-2 ring-accent/40" : "border-border"
      } ${dimmed ? "opacity-35" : "opacity-100"}`}
    >
      <div
        className="flex items-center justify-center gap-2 rounded-t-lg border-b px-3"
        style={{
          height: NODE_HEADER_HEIGHT,
          backgroundColor: withAlpha(accent, 0.16),
          borderBottomColor: withAlpha(accent, 0.35),
        }}
        title={`${table.name} — ${fileName}`}
      >
        <span className="truncate text-[13px] font-semibold" style={{ color: headingColor }}>
          {table.name}
        </span>
        {table.isStub ? (
          <span className="shrink-0 rounded-sm bg-page-alt px-1 text-[9px] uppercase tracking-wide text-muted">
            inferred
          </span>
        ) : null}
        {table.isNew ? (
          <span className="erd-new-chip shrink-0 rounded-sm px-1 text-[9px] font-semibold uppercase tracking-wide">
            new
          </span>
        ) : newColumnCount ? (
          <span
            className="erd-new-chip shrink-0 rounded-sm px-1 text-[9px] font-semibold uppercase tracking-wide"
            title={`${newColumnCount} new ${newColumnCount === 1 ? "column" : "columns"}`}
          >
            +{newColumnCount}
          </span>
        ) : null}
      </div>

      {collapsed ? (
        <div className="relative h-0">
          {table.columns.map((column) => (
            <ColumnHandles key={column.name} columnName={column.name} hidden />
          ))}
        </div>
      ) : (
        <div style={{ paddingTop: NODE_PADDING, paddingBottom: NODE_PADDING }}>
          {table.columns.map((column) => {
            const isConnected = connectedColumns.has(column.name.toLowerCase());
            const isSelected = column.name === selectedColumn;
            const allowedValues = column.enumValues ?? column.checkValues;
            const rowTitle = [
              column.isNew ? "Added by this change" : null,
              column.comment,
              column.type,
              allowedValues?.length ? `one of: ${allowedValues.join(", ")}` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              // The canvas reads this attribute on click to resolve which column was
              // hit, which keeps the click handler out of node data and stable.
              <div
                key={column.name}
                data-erd-column={column.name}
                className={`relative flex cursor-pointer items-center justify-between gap-2 px-3 ${
                  column.isNew ? "erd-new-row " : ""
                }${
                  isSelected ? "bg-accent/15 text-heading" : isConnected ? "text-heading" : "text-body"
                } hover:bg-accent/10`}
                style={{ height: NODE_ROW_HEIGHT }}
                title={rowTitle}
              >
                <ColumnHandles columnName={column.name} />

                <span className="flex min-w-0 items-center gap-1">
                  {column.isPrimaryKey ? (
                    <span className="text-[10px] text-muted" aria-label="primary key">
                      &#128273;
                    </span>
                  ) : null}
                  {!column.isPrimaryKey && isConnected ? (
                    <span
                      className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                      aria-label="referenced column"
                    />
                  ) : null}
                  <span className={`truncate ${column.isPrimaryKey ? "font-semibold" : ""}`}>
                    {column.name}
                  </span>
                  {column.isNew ? (
                    <span className="erd-new-dot shrink-0" aria-label="added by this change" />
                  ) : null}
                </span>

                <span className="shrink-0 text-muted">
                  {column.displayType}
                  {column.nullable ? "?" : ""}
                </span>
              </div>
            );
          })}

          {table.indexes.length ? (
            <div className="border-t border-border">
              <div
                className="flex items-center px-3 text-[9px] uppercase tracking-wide text-muted"
                style={{ height: NODE_SECTION_HEADER_HEIGHT }}
              >
                Indexes
              </div>
              {table.indexes.map((index, position) => (
                <div
                  key={`${index.name ?? "idx"}-${position}`}
                  className="flex items-center gap-1 px-3 text-muted"
                  style={{ height: NODE_ROW_HEIGHT }}
                  title={`${index.unique ? "unique " : ""}index on ${index.columns.join(", ")}`}
                >
                  <span className="text-[9px]">{index.unique ? "✲" : "○"}</span>
                  <span className="truncate">{index.columns.join(", ")}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default memo(ErdTableNode);
