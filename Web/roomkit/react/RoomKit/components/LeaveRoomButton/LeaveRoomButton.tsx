import { useState } from 'react';
import { TUIErrorCode } from '@tencentcloud/tuiroom-engine-js';
import {
  Button,
  TUIDialog,
  MessageBox,
  Option,
  Select,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  RoomParticipantRole,
  useRoomParticipantState,
  useRoomState,
} from 'tuikit-atomicx-react/room';
import { RoomEvent as ConferenceRoomEvent } from '../../adapter/type';
import { eventCenter } from '../../utils/eventCenter';
import styles from './LeaveRoomButton.module.scss';
import type { SelectOptionValue } from '@tencentcloud/uikit-base-component-react';

export interface LeaveRoomButtonProps {
  onLeave?: () => void;
  onEnd?: () => void;
}

export function LeaveRoomButton(props: LeaveRoomButtonProps) {
  const { onLeave, onEnd } = props;
  const { t } = useUIKit();

  const {
    currentRoom,
    leaveRoom: leaveRoomStateApi,
    endRoom: endRoomStateApi,
  } = useRoomState();
  const {
    localParticipant,
    participantList,
    transferOwner,
  } = useRoomParticipantState();

  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Other participants (excluding local user).
  const otherParticipants = participantList.filter(
    participant => participant.userId !== localParticipant?.userId,
  );

  let dialogMessage: string;
  if (otherParticipants.length === 0) {
    dialogMessage = t('Room.LeaveRoomTip');
  } else {
    dialogMessage = t('Room.ConfirmLeaveTip');
  }

  const leaveRoom = async () => {
    try {
      return await leaveRoomStateApi();
    } catch (error) {
      const err = error as { code?: number };
      if (err.code === TUIErrorCode.ERR_INVALID_PARAMETER) {
        return Promise.resolve();
      }
      throw error;
    }
  };

  const endRoom = async () => {
    try {
      return await endRoomStateApi();
    } catch (error) {
      const err = error as { code?: number };
      if (err.code === TUIErrorCode.ERR_INVALID_PARAMETER) {
        return Promise.resolve();
      }
      throw error;
    }
  };

  // Perform leave room action.
  const performLeave = async () => {
    try {
      if (!currentRoom?.roomId) {
        return;
      }
      await leaveRoom();
      onLeave?.();
    } catch (_error) {
      Toast.error({ message: t('Room.LeaveRoomFailed') });
    }
  };

  // Handle end room (from confirmation dialog).
  const handleEndRoom = async () => {
    if (!currentRoom?.roomId || isEnding) {
      return;
    }
    try {
      setIsEnding(true);
      const roomInfo = currentRoom ? { ...currentRoom } : null;
      await endRoom();
      setShowConfirmDialog(false);
      if (roomInfo?.roomId) {
        eventCenter.emit(ConferenceRoomEvent.ROOM_DISMISS, { roomInfo });
      }
      onEnd?.();
    } catch (_error) {
      Toast.error({ message: t('Room.EndRoomFailed') });
    } finally {
      setIsEnding(false);
    }
  };

  // Auto transfer and leave (for case 4: only one other participant).
  const autoTransferAndLeave = async () => {
    if (otherParticipants.length !== 1 || !currentRoom?.roomId) {
      return;
    }
    try {
      const targetParticipant = otherParticipants[0];
      await transferOwner({ userId: targetParticipant.userId });
      await leaveRoom();
      onLeave?.();
    } catch (_error) {
      Toast.error({ message: t('Room.TransferAndLeaveFailed') });
    }
  };

  // Handle leave from confirmation dialog.
  const handleLeaveFromConfirmDialog = () => {
    setShowConfirmDialog(false);

    if (otherParticipants.length === 0) {
      performLeave();
      return;
    }
    if (otherParticipants.length === 1) {
      autoTransferAndLeave();
      return;
    }
    // Case 3: Multiple participants, show transfer dialog.
    setShowTransferDialog(true);
    setSelectedUserId('');
  };

  // Handle transfer owner and leave (from transfer dialog for case 3).
  const handleTransferAndLeave = async () => {
    if (!selectedUserId || !currentRoom?.roomId || isTransferring) {
      return;
    }
    try {
      setIsTransferring(true);
      await transferOwner({ userId: selectedUserId });
      await leaveRoom();
      setShowTransferDialog(false);
      onLeave?.();
    } catch (_error) {
      Toast.error({ message: t('Room.TransferAndLeaveFailed') });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleLeaveRoom = () => {
    if (!currentRoom?.roomId) {
      return;
    }

    const isOwner = localParticipant?.role === RoomParticipantRole.Owner;

    // Case 1: Normal participant (non-owner) - confirm then leave directly.
    if (!isOwner) {
      MessageBox.confirm({
        title: t('Room.ConfirmLeaveTitle'),
        content: t('Room.ConfirmLeaveRoom'),
        callback: (action) => {
          if (action === 'confirm') {
            performLeave();
          }
        },
      });
      return;
    }

    // Case 2 & 3 & 4: Owner - always show confirmation dialog first.
    setShowConfirmDialog(true);
  };

  return (
    <>
      <Button
        color="red"
        disabled={!currentRoom?.roomId}
        onClick={handleLeaveRoom}
      >
        {t('Room.LeaveRoom')}
      </Button>

      <TUIDialog
        visible={showConfirmDialog}
        title={t('Room.ConfirmLeaveTitle')}
        appendTo="#roomPage"
        onClose={() => setShowConfirmDialog(false)}
        footer={(
          <div className={styles.buttonContainer}>
            <Button
              color="red"
              style={{ minWidth: '88px' }}
              loading={isEnding}
              onClick={handleEndRoom}
            >
              {t('Room.EndRoom')}
            </Button>
            <Button
              type="primary"
              style={{ minWidth: '88px' }}
              onClick={handleLeaveFromConfirmDialog}
            >
              {t('Room.LeaveRoom')}
            </Button>
            <Button
              style={{ minWidth: '88px' }}
              onClick={() => setShowConfirmDialog(false)}
            >
              {t('Room.Cancel')}
            </Button>
          </div>
        )}
      >
        <div className={styles.dialogMessage}>{dialogMessage}</div>
      </TUIDialog>

      <TUIDialog
        visible={showTransferDialog}
        title={t('Room.SelectNewHost')}
        appendTo="#roomPage"
        onClose={() => setShowTransferDialog(false)}
        footer={(
          <div className={styles.buttonContainer}>
            <Button
              type="primary"
              style={{ minWidth: '88px' }}
              disabled={!selectedUserId}
              loading={isTransferring}
              onClick={handleTransferAndLeave}
            >
              {t('Room.TransferAndLeave')}
            </Button>
            <Button
              style={{ minWidth: '88px' }}
              onClick={() => setShowTransferDialog(false)}
            >
              {t('Room.Cancel')}
            </Button>
          </div>
        )}
      >
        <Select
          value={selectedUserId}
          placeholder={t('Room.PleaseSelectNewHost')}
          style={{ width: '100%' }}
          teleported={false}
          onChange={value => setSelectedUserId((value as string) ?? '')}
        >
          {otherParticipants.map(participant => (
            <Option
              key={participant.userId}
              value={participant.userId as SelectOptionValue}
              label={
                participant.nameCard
                || participant.userName
                || participant.userId
              }
            />
          ))}
        </Select>
      </TUIDialog>
    </>
  );
}
