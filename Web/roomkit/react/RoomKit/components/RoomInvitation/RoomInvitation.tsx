import { useEffect, useRef, useState } from 'react';
import {
  Button,
  IconEnterRoom,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { Avatar } from 'tuikit-atomicx-react/room';
import styles from './RoomInvitation.module.scss';

export interface RoomInvitationOptions {
  /** Inviter's display name, rendered in the invitation text. */
  inviterName: string;
  /** Inviter's avatar URL. */
  inviterAvatar: string;
  /** Room name shown as the primary title. */
  roomName: string;
  /** Host name displayed in the room details line. */
  hostName: string;
  /** Number of participants currently in the room. */
  participantCount: number;
  /** Countdown duration in seconds before `onTimeout` fires. Defaults to 30. */
  duration?: number;
  /** Fired when the user clicks the "Not Join" button. */
  onCancel?: () => void;
  /** Fired when the user clicks the "Join" button. */
  onAccept?: () => void;
  /** Fired when the countdown reaches zero with no user action. */
  onTimeout?: () => void;
}

export interface RoomInvitationProps {
  options: RoomInvitationOptions;
}

export function RoomInvitation({ options }: RoomInvitationProps) {
  const { t } = useUIKit();
  const {
    inviterName,
    inviterAvatar,
    roomName,
    hostName,
    participantCount,
    duration = 30,
    onCancel,
    onAccept,
    onTimeout,
  } = options;

  const [countdown, setCountdown] = useState(duration);

  // Keep latest onTimeout in a ref so the interval effect does not re-register
  // each time the parent recreates its callback.
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (duration <= 0) return;
    let remaining = duration;
    setCountdown(remaining);

    const interval = window.setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        onTimeoutRef.current?.();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [duration]);

  return (
    <div className={styles.invitationContainer}>
      <div className={styles.header}>
        <Avatar src={inviterAvatar} size={40} className={styles.avatar} />
        <div className={styles.inviteText}>
          <span className={styles.inviteTextContent}>
            {t('RoomInvitation.InviteText', { name: inviterName })}
          </span>
        </div>
      </div>

      <div className={styles.roomInfo}>
        <h3 className={styles.roomTitle}>{roomName}</h3>
        <div className={styles.roomDetails}>
          <span className={styles.detail}>
            {t('RoomInvitation.Host')}
            {hostName}
          </span>
          <span className={styles.divider}>|</span>
          <span className={styles.detail}>
            {t('RoomInvitation.Participants')}
            {participantCount}
            {t('RoomInvitation.ParticipantsUnit')}
          </span>
        </div>
      </div>

      <div className={styles.dividerLine} />

      <div className={styles.actions}>
        <Button type="default" color="gray" size="big" onClick={onCancel}>
          <span className={styles.cancelText}>
            {t('RoomInvitation.NotJoin')}
            {countdown > 0 && (
              <span className={styles.countdown}>({countdown}s)</span>
            )}
          </span>
        </Button>
        <Button type="primary" size="big" onClick={onAccept}>
          <span className={styles.acceptText}>
            <IconEnterRoom />
            {t('RoomInvitation.JoinMeeting')}
          </span>
        </Button>
      </div>
    </div>
  );
}
