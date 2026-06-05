import { useEffect, useState } from 'react';

// Matches the default CSS `transition: opacity 0.3s` used by most overlays in
// the RoomKit. Callers with a different transition duration should pass it
// explicitly so the mask stays mounted long enough for the fade-out to finish.
const DEFAULT_FADE_MS = 300;

/**
 * Two-phase visibility state for an element that should fade in / out via a CSS
 * opacity transition.
 *
 * `mounted` controls DOM presence; `active` drives the class that animates
 * opacity from 0 to 1. When `visible` flips to true we mount immediately and
 * defer flipping `active` to the next animation frame so the browser commits
 * the initial `opacity: 0` state first — otherwise the transition is skipped
 * and the element snaps in. When `visible` flips to false we clear `active`
 * immediately and only unmount after the fade-out completes.
 *
 * Mirrors Vue's `<transition>` enter/leave class lifecycle without pulling in
 * `react-transition-group`.
 *
 * @param visible Whether the element should currently be shown.
 * @param duration Milliseconds matching the consuming CSS transition; defaults
 *   to {@link DEFAULT_FADE_MS}.
 */
export function useLoadingFade(visible: boolean, duration = DEFAULT_FADE_MS) {
  const [mounted, setMounted] = useState(visible);
  const [active, setActive] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const raf = window.requestAnimationFrame(() => setActive(true));
      return () => window.cancelAnimationFrame(raf);
    }
    setActive(false);
    const timer = window.setTimeout(() => setMounted(false), duration);
    return () => window.clearTimeout(timer);
  }, [visible, duration]);

  return { mounted, active };
}

export default useLoadingFade;
