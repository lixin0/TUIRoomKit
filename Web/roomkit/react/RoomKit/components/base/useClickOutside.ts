import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export type ClickOutsideHandler = (event: MouseEvent | TouchEvent) => void;

/**
 * Invokes `handler` when a `click` / `touchend` event fires outside the element
 * referenced by `ref`. The handler is captured in a ref so consumers do not
 * have to memoise it; listeners are attached once and stay attached for the
 * lifetime of the component.
 *
 * @example
 * ```tsx
 * const menuRef = useRef<HTMLDivElement>(null);
 * useClickOutside(menuRef, () => setOpen(false));
 * return <div ref={menuRef}>...</div>;
 * ```
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler?: ClickOutsideHandler,
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const callback = handlerRef.current;
      if (!callback) return;
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      callback(event);
    };

    document.addEventListener('click', listener);
    document.addEventListener('touchend', listener);

    return () => {
      document.removeEventListener('click', listener);
      document.removeEventListener('touchend', listener);
    };
  }, [ref]);
}
