import { useMemo } from 'react';
import {
  IconCopy,
  TUIButton,
  TUIDialog,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { RoomType } from 'tuikit-atomicx-react/room';
import { conference as conferenceImpl } from '../../adapter/conference';
import { useCopy } from '../../hooks/useCopy';
import { generateRoomLink } from '../../utils/utils';
import styles from './RoomInviteSuccessDialog.module.scss';
import type { IConference } from '../../adapter/type';

const conference = conferenceImpl as unknown as IConference;

export interface RoomInviteSuccessDialogProps {
  visible: boolean;
  roomId: string;
  password?: string;
  roomType: RoomType;
  onClose: () => void;
}

export function RoomInviteSuccessDialog(props: RoomInviteSuccessDialogProps) {
  const {
    visible,
    roomId,
    password,
    roomType,
    onClose,
  } = props;
  const { t } = useUIKit();
  const { copy } = useCopy();

  const roomLink = useMemo(() => {
    const customLink = conference.getFeatureConfig('shareLink');
    if (customLink) {
      return customLink;
    }
    if (!roomId) {
      return '';
    }
    return generateRoomLink(roomId, password, roomType);
  }, [roomId, password, roomType]);

  const copyRoomIdAndLink = async () => {
    if (!roomId) {
      Toast.error({ message: t('RoomShare.NoRoomInfo') });
      return;
    }
    const lines = [
      `${t('RoomShare.RoomId')}: ${roomId}`,
      password ? `${t('RoomShare.Password')}: ${password}` : null,
      `${t('RoomShare.RoomLink')}: ${roomLink}`,
    ].filter(Boolean);
    await copy(lines.join('\n'));
  };

  return (
    <TUIDialog
      visible={visible}
      title={t('RoomShare.BookingSuccess')}
      showConfirm={false}
      showCancel={false}
      teleported={false}
      onClose={onClose}
    >
      <div className={styles.roomInviteContent}>
        <div className={styles.inviteItem}>
          <div className={styles.inviteLabel}>{t('RoomShare.RoomId')}</div>
          <div className={styles.inviteValue}>
            {roomId}
            <IconCopy
              className={styles.copyIcon}
              onClick={() => copy(roomId)}
            />
          </div>
        </div>

        {password && (
          <div className={styles.inviteItem}>
            <div className={styles.inviteLabel}>{t('RoomShare.Password')}</div>
            <div className={styles.inviteValue}>
              {password}
              <IconCopy
                className={styles.copyIcon}
                onClick={() => copy(password)}
              />
            </div>
          </div>
        )}

        <div className={styles.inviteItem}>
          <div className={styles.inviteLabel}>{t('RoomShare.RoomLink')}</div>
          <div className={`${styles.inviteValue} ${styles.roomLink}`}>
            <span className={styles.roomLinkText}>{roomLink}</span>
            <IconCopy
              className={styles.copyIcon}
              onClick={() => copy(roomLink)}
            />
          </div>
        </div>

        <div className={styles.inviteActions}>
          <TUIButton
            type="primary"
            size="large"
            className={styles.copyButton}
            onClick={copyRoomIdAndLink}
          >
            {t('RoomShare.CopyMeetingIdAndLink')}
          </TUIButton>
        </div>
      </div>
    </TUIDialog>
  );
}
