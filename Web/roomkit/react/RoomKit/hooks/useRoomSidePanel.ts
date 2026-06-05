import { useCallback, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

export interface SidePanelRenderContext {
  /** Whether the panel is currently the active one in the side panel slot. */
  isActive: boolean;
  /**
   * When true, the panel stays mounted while inactive and should hide itself
   * (e.g. `display: none` on its root). Mirrors Vue `v-show` on the panel component.
   */
  keepAlive?: boolean;
}

export interface SidePanelConfig {
  /** Unique panel id. Registering twice with the same id replaces the previous entry. */
  id: string;
  /**
   * Title rendered in the panel header. The function form is re-invoked on
   * each consumer render, so it can pull live i18n values without extra wiring.
   */
  title: string | (() => string);
  /**
   * Renders the panel body. Called from the consumer's render tree, so
   * captures of outer closures (e.g. `activeId`) stay fresh and React hooks
   * can be used by wrapping the JSX in a small inner component if needed.
   */
  render: (context: SidePanelRenderContext) => ReactNode;
  /**
   * Keep the panel mounted after the first activation and toggle visibility
   * with `display: none`. Useful for panels that own expensive state (chat
   * history, scrolling lists, etc.) that should survive being hidden.
   */
  keepAlive?: boolean;
}

interface UseRoomSidePanelReturn {
  /** Id of the currently open panel, or `null` if none is open. */
  activeId: string | null;
  /** Active panel config, or `null` if none is open. */
  activePanel: SidePanelConfig | null;
  /** Resolved header title for the active panel (empty string when none). */
  sidePanelTitle: string;
  /** All registered side panels, in registration order. */
  sidePanels: SidePanelConfig[];
  /**
   * Register a side panel with the store. Returns an unregister function;
   * call it from your effect cleanup. Registering an `id` that is already
   * present replaces the previous entry.
   *
   * @example
   * ```tsx
   * function ChatRegistrar() {
   *   const { registerSidePanel } = useRoomSidePanel();
   *   useEffect(() => registerSidePanel({
   *     id: BuiltinWidget.RoomChatWidget,
   *     title: () => t('Chat.Title'),
   *     keepAlive: true,
   *     render: ({ isActive }) => <RoomChat isActive={isActive} />,
   *   }), [registerSidePanel, t]);
   *   return null;
   * }
   * ```
   */
  registerSidePanel: (config: SidePanelConfig) => () => void;
  /** Open the panel if it is closed, close it if it is already active. */
  togglePanel: (id: string) => void;
  /** Close whichever panel is currently active. */
  closePanel: () => void;
}

// ---- Module-private singleton store ----
// Single source of truth shared by every `useRoomSidePanel` consumer. Kept
// inside this file (not exported, not surfaced on `conference`) so the whole
// register / open / close lifecycle stays closed-loop in the hook.
let activeId: string | null = null;
const panels = new Map<string, SidePanelConfig>();
let panelsSnapshot: readonly SidePanelConfig[] = [];
const listeners = new Set<() => void>();

const refreshPanelsSnapshot = () => {
  panelsSnapshot = Array.from(panels.values());
};

const notify = () => {
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Stable snapshot getters — `useSyncExternalStore` requires the returned value
// to be referentially equal across calls when nothing has changed, otherwise
// it tears down and re-runs the subscription on every render.
const getActiveSnapshot = () => activeId;
const getPanelsSnapshot = () => panelsSnapshot;

const setActiveId = (next: string | null) => {
  if (activeId === next) {
    return;
  }
  activeId = next;
  notify();
};

// Stable module-level function — exposed only via the hook return below. The
// identity stays constant across renders so consumers can use it in
// `useEffect` deps without re-running the effect.
const registerSidePanel = (config: SidePanelConfig): () => void => {
  panels.set(config.id, config);
  refreshPanelsSnapshot();
  notify();
  return () => {
    // Guard against double-unregister and against unregistering an entry that
    // a later `registerSidePanel(sameId, ...)` has already replaced.
    if (panels.get(config.id) !== config) {
      return;
    }
    panels.delete(config.id);
    refreshPanelsSnapshot();
    if (activeId === config.id) {
      activeId = null;
    }
    notify();
  };
};

export function useRoomSidePanel(): UseRoomSidePanelReturn {
  const active = useSyncExternalStore(subscribe, getActiveSnapshot, getActiveSnapshot);
  const sidePanels = useSyncExternalStore(subscribe, getPanelsSnapshot, getPanelsSnapshot);

  const activePanel = active ? panels.get(active) ?? null : null;

  const sidePanelTitle = !activePanel
    ? ''
    : typeof activePanel.title === 'function'
      ? activePanel.title()
      : activePanel.title;

  const togglePanel = useCallback((id: string) => {
    setActiveId(activeId === id ? null : id);
  }, []);

  const closePanel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    activeId: active,
    activePanel,
    sidePanelTitle,
    sidePanels: sidePanels as SidePanelConfig[],
    registerSidePanel,
    togglePanel,
    closePanel,
  };
}
