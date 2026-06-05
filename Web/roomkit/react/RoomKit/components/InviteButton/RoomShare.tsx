import { useMemo } from 'react';
import {
  IconCopy,
  TUIButton,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { conference as conferenceImpl } from '../../adapter/conference';
import { useCopy } from '../../hooks/useCopy';
import { generateRoomLink } from '../../utils/utils';
import styles from './RoomShare.module.scss';
import type { IConference } from '../../adapter/type';
import type { RoomInfo } from 'tuikit-atomicx-react/room';

const conference = conferenceImpl as unknown as IConference;

export interface RoomShareProps {
  /** Current room info; when null/undefined the empty state is rendered. */
  roomInfo: RoomInfo | null | undefined;
}

const formatDateTime = (timestamp?: number): string => {
  if (!timestamp) {
    return '--';
  }
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export function RoomShare({ roomInfo }: RoomShareProps) {
  const { t } = useUIKit();
  const { copy } = useCopy();

  const roomLink = useMemo(() => {
    const customLink = conference.getFeatureConfig('shareLink');
    if (customLink) {
      return customLink;
    }
    if (!roomInfo?.roomId) {
      return '';
    }
    return generateRoomLink(roomInfo.roomId, roomInfo.password, roomInfo.roomType);
  }, [roomInfo?.roomId, roomInfo?.password, roomInfo?.roomType]);

  const copyRoomInfoAndLink = async () => {
    if (!roomInfo) {
      Toast.error({ message: t('RoomShare.NoRoomInfo') });
      return;
    }
    const lines = [
      `${t('RoomShare.RoomName')}: ${roomInfo.roomName}`,
      `${t('RoomShare.RoomId')}: ${roomInfo.roomId}`,
      roomInfo.password
        ? `${t('RoomShare.Password')}: ${roomInfo.password}`
        : null,
      roomInfo.scheduledStartTime && roomInfo.scheduledEndTime
        ? `${t('RoomShare.RoomTime')}: ${formatDateTime(roomInfo.scheduledStartTime)} - ${formatDateTime(roomInfo.scheduledEndTime)}`
        : null,
      `${t('RoomShare.RoomLink')}: ${roomLink}`,
    ].filter(Boolean);
    await copy(lines.join('\n'));
  };

  if (!roomInfo) {
    return (
      <div className={styles.roomShare}>
        <div className={styles.empty}>{t('RoomShare.NoRoomInfo')}</div>
      </div>
    );
  }

  return (
    <div className={styles.roomShare}>
      <div className={styles.content}>
        <div className={styles.shareItem}>
          <div className={styles.label}>{t('RoomShare.RoomName')}</div>
          <div className={styles.value}>{roomInfo.roomName}</div>
        </div>

        {roomInfo.scheduledStartTime && roomInfo.scheduledEndTime && (
          <div className={styles.shareItem}>
            <div className={styles.label}>{t('RoomShare.RoomTime')}</div>
            <div className={styles.value}>
              {formatDateTime(roomInfo.scheduledStartTime)}
              {' - '}
              {formatDateTime(roomInfo.scheduledEndTime)}
            </div>
          </div>
        )}

        <div className={styles.shareItem}>
          <div className={styles.label}>{t('RoomShare.RoomId')}</div>
          <div className={styles.value}>
            {roomInfo.roomId}
            <IconCopy
              className={styles.copyIcon}
              onClick={() => copy(roomInfo.roomId || '')}
            />
          </div>
        </div>

        {roomInfo.password && (
          <div className={styles.shareItem}>
            <div className={styles.label}>{t('RoomShare.Password')}</div>
            <div className={styles.value}>
              {roomInfo.password}
              <IconCopy
                className={styles.copyIcon}
                onClick={() => copy(roomInfo.password || '')}
              />
            </div>
          </div>
        )}

        <div className={styles.shareItem}>
          <div className={styles.label}>{t('RoomShare.RoomLink')}</div>
          <div className={`${styles.value} ${styles.roomLink}`}>
            <span className={styles.roomLinkText}>{roomLink}</span>
            <IconCopy
              className={styles.copyIcon}
              onClick={() => copy(roomLink)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <TUIButton
            type="primary"
            size="large"
            className={styles.copyButton}
            onClick={copyRoomInfoAndLink}
          >
            {t('RoomShare.CopyMeetingIdAndLink')}
          </TUIButton>
        </div>
      </div>
    </div>
  );
}
