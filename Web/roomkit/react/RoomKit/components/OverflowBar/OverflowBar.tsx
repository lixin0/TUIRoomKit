import React, { useRef } from 'react';
import type { ReactNode } from 'react';
import { MoreButton } from './MoreButton';
import { useControlBarOverflow } from './useControlBarOverflow';

interface OverflowBarProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Overflow-aware toolbar container.
 *
 * Renders children directly when they fit within the container width.
 * When they overflow, the excess items are moved into a MoreButton dropdown.
 * Callers simply pass all items as children without tracking which are visible.
 */
export function OverflowBar({ className, children }: OverflowBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // React.Children.toArray filters out null/undefined/false so conditional
  // children like `{flag && <Button />}` are counted correctly.
  const items = React.Children.toArray(children);
  const visibleCount = useControlBarOverflow(containerRef, items.length);

  const hasOverflow = visibleCount < items.length;
  const visibleItems = hasOverflow ? items.slice(0, visibleCount) : items;
  const overflowItems = hasOverflow ? items.slice(visibleCount) : [];

  return (
    <div ref={containerRef} className={className}>
      {visibleItems}
      {hasOverflow && (
        <MoreButton>
          {overflowItems}
        </MoreButton>
      )}
    </div>
  );
}
