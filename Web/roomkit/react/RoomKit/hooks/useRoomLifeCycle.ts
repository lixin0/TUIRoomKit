import { TUIErrorCode } from '@tencentcloud/tuiroom-engine-js';
import {
  TUIMessageBox,
  TUIToast,
  i18next,
} from '@tencentcloud/uikit-base-component-react';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import { RoomEvent } from '../adapter/type';
import { eventCenter } from '../utils/eventCenter';

interface RoomLifeCycleState {
  isJoiningRoom: boolean;
  joiningRoomId: string;
  roomPasswordVisible: boolean;
}

interface RoomLifeCycleAction {
  setIsJoiningRoom: (value: boolean) => void;
  setJoiningRoomId: (value: string) => void;
  setRoomPasswordVisible: (value: boolean) => void;
}

type RoomLifeCycleStore = RoomLifeCycleState & RoomLifeCycleAction;

export const roomLifeCycleStore = createStore<RoomLifeCycleStore>(set => ({
  isJoiningRoom: false,
  joiningRoomId: '',
  roomPasswordVisible: false,
  setIsJoiningRoom: value => set({ isJoiningRoom: value }),
  setJoiningRoomId: value => set({ joiningRoomId: value }),
  setRoomPasswordVisible: value => set({ roomPasswordVisible: value }),
}));

// Vanilla join-room error handler. Lives at module scope so non-React callers
// (e.g. the `Conference` adapter class) can react to join failures without
// violating the rules of hooks. Translation goes through `i18next.t` directly,
// store mutation through `roomLifeCycleStore.getState()`.
export function handleJoinRoomError(error: unknown): void {
  const code = (error as { code?: number })?.code;
  const t = i18next.t.bind(i18next);

  let errorMessage = '';
  let useAlert = false;

  switch (code) {
    case TUIErrorCode.ERR_NEED_PASSWORD:
      roomLifeCycleStore.getState().setRoomPasswordVisible(true);
      return;
    case TUIErrorCode.ERR_WRONG_PASSWORD:
      TUIToast.error({ message: t('Room.InvalidPassword') });
      return;
    case TUIErrorCode.ERR_ROOM_ID_NOT_EXIST:
      errorMessage = t('Room.RoomNotFound');
      useAlert = true;
      break;
    case TUIErrorCode.ERR_ROOM_USER_FULL:
      errorMessage = t('Room.RoomFull');
      useAlert = true;
      break;
    case TUIErrorCode.ERR_ROOM_ID_OCCUPIED:
      errorMessage = t('Room.RoomOccupied');
      useAlert = true;
      break;
    default:
      errorMessage = t('Room.JoinRoomError');
      // eslint-disable-next-line no-console
      console.error('Join room error:', error);
      eventCenter.emit(RoomEvent.ROOM_ERROR, error);
  }

  if (!errorMessage) {
    return;
  }

  if (useAlert) {
    TUIMessageBox.alert({
      type: 'error',
      modal: false,
      showClose: false,
      title: t('Room.Alert'),
      content: errorMessage,
      callback: () => {
        eventCenter.emit(RoomEvent.ROOM_ERROR, error);
      },
    });
  } else {
    TUIToast.error({ message: errorMessage });
  }
}

// React hook surface kept identical to the previous version so existing
// component-side consumers (e.g. `ConferenceMainView`) keep their snapshot
// subscriptions and don't need any changes.
export default function useRoomLifeCycle() {
  const isJoiningRoom = useStore(roomLifeCycleStore, state => state.isJoiningRoom);
  const joiningRoomId = useStore(roomLifeCycleStore, state => state.joiningRoomId);
  const roomPasswordVisible = useStore(roomLifeCycleStore, state => state.roomPasswordVisible);
  const setIsJoiningRoom = useStore(roomLifeCycleStore, state => state.setIsJoiningRoom);
  const setJoiningRoomId = useStore(roomLifeCycleStore, state => state.setJoiningRoomId);
  const setRoomPasswordVisible = useStore(roomLifeCycleStore, state => state.setRoomPasswordVisible);

  return {
    isJoiningRoom,
    joiningRoomId,
    roomPasswordVisible,
    setIsJoiningRoom,
    setJoiningRoomId,
    setRoomPasswordVisible,
    handleJoinRoomError,
  };
}
