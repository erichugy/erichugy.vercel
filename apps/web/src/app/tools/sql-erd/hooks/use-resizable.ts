"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Axis = "horizontal" | "vertical";

interface UseResizableOptions {
  axis: Axis;
  min: number;
  max: number;
  initial: number;
  /** Invert when the panel grows in the opposite direction to the pointer. */
  invert?: boolean;
  onCommit?: (value: number) => void;
}

export function useResizable({ axis, min, max, initial, invert, onCommit }: UseResizableOptions) {
  const [size, setSize] = useState(initial);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ pointer: 0, size: initial });
  const latestSize = useRef(initial);

  const startResize = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      dragStart.current = {
        pointer: axis === "horizontal" ? event.clientX : event.clientY,
        size,
      };
      latestSize.current = size;
      setIsResizing(true);
    },
    [axis, size],
  );

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const pointer = axis === "horizontal" ? event.clientX : event.clientY;
      const delta = (pointer - dragStart.current.pointer) * (invert ? -1 : 1);
      const next = Math.min(Math.max(dragStart.current.size + delta, min), max);

      latestSize.current = next;
      setSize(next);
    };

    const handleUp = () => {
      setIsResizing(false);
      onCommit?.(latestSize.current);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [axis, invert, isResizing, max, min, onCommit]);

  return { size, setSize, isResizing, startResize };
}
