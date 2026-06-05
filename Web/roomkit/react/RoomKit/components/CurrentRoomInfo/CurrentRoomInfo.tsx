import { useEffect, useMemo, useState } from 'react';
import {
  IconCaretDownSmall,
  IconCopy,
  TUIDropdown,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { useRoomState } from 'tuikit-atomicx-react/room';
import { conference as conferenceImpl } from '../../adapter/conference';
import { useCopy } from '../../hooks/useCopy';
import { generateRoomLink } from '../../utils/utils';
import styles from './CurrentRoomInfo.module.scss';
import type { IConference } from '../../adapter/type';

const conference = conferenceImpl as unknown as IConference;

function formatDurationTime(createTime: number | undefined, now: number) {
  if (!createTime) {
    return '00:00';
  }

  const totalSeconds = Math.floor((now - createTime) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Conference header room title with duration and room detail dropdown.
 */
export function CurrentRoomInfo() {
  const { t } = useUIKit();
  const { currentRoom } = useRoomState();
  const { copy } = useCopy();
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const roomLink = useMemo(() => {
    const customLink = conference.getFeatureConfig('shareLink');
    if (customLink) {
      return customLink;
    }
    if (!currentRoom?.roomId) {
      return '';
    }
    return generateRoomLink(
      currentRoom.roomId,
      currentRoom.password,
      currentRoom.roomType,
    );
  }, [currentRoom?.roomId, currentRoom?.password, currentRoom?.roomType]);

  const durationTime = useMemo(
    () => formatDurationTime(currentRoom?.createTime, currentTime),
    [currentRoom?.createTime, currentTime],
  );

  if (!currentRoom?.roomId) {
    return null;
  }

  const roomTitle = currentRoom.roomName || currentRoom.roomId;
  const hostName = currentRoom.roomOwner?.userName || currentRoom.roomOwner?.userId || '';

  const dropdownContent = (
    <div className={styles.roomInfo}>
      <div className={styles.roomInfoItem}>
        <div className={styles.roomInfoLabel}>
          {t('CurrentRoomInfo.Host')}
        </div>
        <div className={styles.roomInfoValue}>{hostName}</div>
      </div>
      <div className={styles.roomInfoItem}>
        <div className={styles.roomInfoLabel}>
          {t('CurrentRoomInfo.RoomId')}
        </div>
        <div className={styles.roomInfoValue}>{currentRoom.roomId}</div>
        <div
          className={styles.roomInfoCopy}
          onClick={() => copy(currentRoom.roomId)}
        >
          <IconCopy className={styles.copyIcon} />
          <span>{t('CurrentRoomInfo.Copy')}</span>
        </div>
      </div>
      {currentRoom.password
        ? (
          <div className={styles.roomInfoItem}>
            <div className={styles.roomInfoLabel}>
              {t('CurrentRoomInfo.Password')}
            </div>
            <div className={styles.roomInfoValue}>{currentRoom.password}</div>
            <div
              className={styles.roomInfoCopy}
              onClick={() => copy(currentRoom.password ?? '')}
            >
              <IconCopy className={styles.copyIcon} />
              <span>{t('CurrentRoomInfo.Copy')}</span>
            </div>
          </div>
        )
        : null}
      <div className={styles.roomInfoItem}>
        <div className={styles.roomInfoLabel}>
          {t('CurrentRoomInfo.RoomLink')}
        </div>
        <div className={styles.roomInfoValue}>{roomLink}</div>
        <div
          className={styles.roomInfoCopy}
          onClick={() => copy(roomLink)}
        >
          <IconCopy className={styles.copyIcon} />
          <span>{t('CurrentRoomInfo.Copy')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.roomHeader}>
      <TUIDropdown
        trigger="click"
        placement="bottom"
        hideOnClick={false}
        teleported={false}
        dropdownContent={dropdownContent}
      >
        <div className={styles.roomTitle}>
          <span className={styles.roomTitleName}>{roomTitle}</span>
          <IconCaretDownSmall size={24} className={styles.roomTitleIcon} />
          <span className={styles.roomDuration}>{durationTime}</span>
        </div>
      </TUIDropdown>
    </div>
  );
}
