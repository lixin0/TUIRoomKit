import { useState, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/** Width of a single IconButton in vertical layout (matches .contentVertical min-width). */
const ITEM_WIDTH = 56;
/** Gap between items in the control bar center (matches .controlCenter gap). */
const ITEM_GAP = 16;
/** Reserved width for the MoreButton itself. */
const MORE_BUTTON_WIDTH = 56;

/**
 * Calculates how many control bar items fit inside the container before
 * overflowing into the MoreButton. Returns the number of visible items;
 * `Infinity` means all items fit and no MoreButton is needed.
 *
 * Uses a ResizeObserver on the container so the count updates whenever the
 * panel is resized (e.g. side panel open/close, window resize).
 */
export function useControlBarOverflow(
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number,
): number {
  const [visibleCount, setVisibleCount] = useState(Number.POSITIVE_INFINITY);

  const itemCountRef = useRef(itemCount);
  itemCountRef.current = itemCount;

  const recalculateRef = useRef<() => void>(() => {});
  recalculateRef.current = () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const containerWidth = container.offsetWidth;
    const count = itemCountRef.current;
    const totalWidth = count * ITEM_WIDTH + Math.max(0, count - 1) * ITEM_GAP;

    if (totalWidth <= containerWidth) {
      setVisibleCount(Number.POSITIVE_INFINITY);
      return;
    }

    // Reserve space for the MoreButton and one gap before it
    const available = containerWidth - MORE_BUTTON_WIDTH - ITEM_GAP;
    const visible = Math.max(0, Math.floor((available + ITEM_GAP) / (ITEM_WIDTH + ITEM_GAP)));
    setVisibleCount(visible);
  };

  // Re-calculate when item count changes (e.g. webinar host toggles visibility)
  useEffect(() => {
    recalculateRef.current();
  }, [itemCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const run = () => recalculateRef.current();
    const observer = new ResizeObserver(run);
    observer.observe(container);
    run();
    return () => observer.disconnect();
  }, [containerRef]);

  return visibleCount;
}
