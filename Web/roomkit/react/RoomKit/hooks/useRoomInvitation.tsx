import { useCallback, useEffect, useRef, useState } from 'react';
import { TUIToast, useUIKit } from '@tencentcloud/uikit-base-component-react';
import { createPortal } from 'react-dom';
import {
  RoomEvent,
  useRoomState,
  CallRejectReason,
  RoomType,
} from 'tuikit-atomicx-react/room';
import { RoomInvitation } from '../components';
import type { RoomInvitationOptions } from '../components/RoomInvitation/RoomInvitation';
import type { RoomCall, RoomInfo } from 'tuikit-atomicx-react/room';

function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * Parameters for accepting a room call.
 */
export interface AcceptCallParams {
  roomId: string;
  password?: string;
  roomType: RoomType;
}

/**
 * Options for configuring room invitation behavior.
 */
export interface UseRoomInvitationOptions {
  onAcceptCall?: (params: AcceptCallParams) => void;
}

/**
 * React hook for handling incoming room invitations.
 *
 * Subscribes to the underlying RoomEngine call events and surfaces an
 * invitation toast. The returned React node MUST be rendered by the caller —
 * typically alongside the app router — so that the invitation participates in
 * the host app's React tree and inherits providers such as `UIKitProvider`.
 *
 * Internally the invitation is rendered via `ReactDOM.createPortal` to
 * `document.body`, so it appears as an overlay regardless of where the hook
 * is mounted, while the fiber tree (and therefore context) stays attached to
 * the caller. This avoids the "useLanguage must be used within a
 * LanguageProvider" crash that a detached `createRoot` render would cause.
 */
export function useRoomInvitation(
  options?: UseRoomInvitationOptions,
): React.ReactNode {
  const { t } = useUIKit();
  const {
    currentRoom,
    subscribeEvent,
    unsubscribeEvent,
    rejectCall,
    acceptCall,
  } = useRoomState();
  const { onAcceptCall } = options ?? {};
  const currentRoomRef = useLatestRef(currentRoom);
  const onAcceptCallRef = useLatestRef(onAcceptCall);
  const tRef = useLatestRef(t);

  const [activeInvitation, setActiveInvitation]
    = useState<RoomInvitationOptions | null>(null);

  const dismiss = useCallback(() => setActiveInvitation(null), []);

  useEffect(() => {
    const handleRoomCallReceived = ({
      roomInfo,
      call,
    }: {
      roomInfo: RoomInfo;
      call: RoomCall;
    }) => {
      const { caller } = call;

      if (currentRoomRef.current?.roomId) {
        rejectCall({
          roomId: roomInfo.roomId,
          reason: CallRejectReason.InOtherRoom,
        });
        return;
      }

      setActiveInvitation({
        inviterName: caller.userName,
        inviterAvatar: caller.avatarUrl,
        roomName: roomInfo.roomName,
        hostName: roomInfo.roomOwner.userName,
        participantCount: roomInfo.participantCount ?? 0,
        duration: 60,
        onCancel: () => {
          rejectCall({ roomId: roomInfo.roomId });
          dismiss();
        },
        onAccept: () => {
          acceptCall({ roomId: roomInfo.roomId });
          onAcceptCallRef.current?.({
            roomId: roomInfo.roomId,
            password: roomInfo.password || '',
            roomType: roomInfo.roomType,
          });
          dismiss();
        },
        onTimeout: dismiss,
      });
    };

    const onRoomCallHandledByOtherDevice = () => {
      TUIToast.info({
        message: tRef.current('RoomInvitation.HandleByOtherDevice'),
      });
      dismiss();
    };

    subscribeEvent(RoomEvent.onCallReceived, handleRoomCallReceived);
    subscribeEvent(
      RoomEvent.onCallHandledByOtherDevice,
      onRoomCallHandledByOtherDevice,
    );

    return () => {
      unsubscribeEvent(RoomEvent.onCallReceived, handleRoomCallReceived);
      unsubscribeEvent(
        RoomEvent.onCallHandledByOtherDevice,
        onRoomCallHandledByOtherDevice,
      );
    };
    // `dismiss` is stable (memoized), the refs (`currentRoomRef`,
    // `onAcceptCallRef`, `tRef`) intentionally read latest values without
    // re-subscribing, so the dep list only needs the SDK action refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeEvent, unsubscribeEvent, rejectCall, acceptCall]);

  if (!activeInvitation) {
    return null;
  }

  return createPortal(
    <RoomInvitation options={activeInvitation} />,
    document.body,
  );
}
