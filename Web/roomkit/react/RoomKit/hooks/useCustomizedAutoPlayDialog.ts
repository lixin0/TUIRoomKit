import { useEffect, useRef } from 'react';
import TUIRoomEngine, { TUIRoomEvents } from '@tencentcloud/tuiroom-engine-js';
import {
  useUIKit,
  TUIMessageBox,
} from '@tencentcloud/uikit-base-component-react';
import { useRoomEngine } from 'tuikit-atomicx-react/room';

// `useRoomEngine` is a plain accessor (not a React hook), so a module-level
// snapshot is safe and matches the Vue3 implementation.
const roomEngine = useRoomEngine();

// Module-level guard so the dialog is shown only once across remounts/instances.
let isShowAutoPlayDialog = false;

export default function useCustomizedAutoPlayDialog() {
  const { t } = useUIKit();

  // Latest-ref pattern: keep a stable reference to the i18n translator so the
  // effect can subscribe just once. If we listed `t` in deps, switching the
  // app language would re-run the effect; cleanup would detach the listener,
  // but `TUIRoomEngine.once('ready', ...)` would no longer fire (the `ready`
  // event has already been emitted), leaving the dialog permanently disabled.
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    let cancelled = false;

    const onAutoPlayFailed = () => {
      if (cancelled || isShowAutoPlayDialog) {
        return;
      }
      isShowAutoPlayDialog = true;
      TUIMessageBox.alert({
        title: tRef.current('RoomCommon.Attention'),
        content: tRef.current('RoomNotifications.AudioPlaybackFailed'),
        showClose: false,
        modal: false,
        confirmText: tRef.current('Confirm'),
        callback: () => {
          isShowAutoPlayDialog = false;
        },
      });
    };

    TUIRoomEngine.once('ready', () => {
      if (cancelled) {
        return;
      }
      roomEngine.instance?.on(TUIRoomEvents.onAutoPlayFailed, onAutoPlayFailed);
    });

    return () => {
      cancelled = true;
      roomEngine.instance?.off(TUIRoomEvents.onAutoPlayFailed, onAutoPlayFailed);
    };
  }, []);
}

export { useCustomizedAutoPlayDialog };
