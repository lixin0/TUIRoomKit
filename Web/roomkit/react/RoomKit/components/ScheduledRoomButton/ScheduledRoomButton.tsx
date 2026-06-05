import { useState } from 'react';
import {
  IconScheduleRoom,
  TUIButton,
  TUIDialog,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  RoomType,
  ScheduleRoomPanel,
  useLoginState,
} from 'tuikit-atomicx-react/room';
import { RoomInviteSuccessDialog } from './RoomInviteSuccessDialog';
import styles from './ScheduledRoomButton.module.scss';
import type { ScheduleRoomOptions } from 'tuikit-atomicx-react/room';

export function ScheduledRoomButton() {
  const { t } = useUIKit();
  const { loginUserInfo } = useLoginState();

  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [scheduledRoomId, setScheduledRoomId] = useState('');
  const [scheduledPassword, setScheduledPassword] = useState('');
  // Defaults to Standard because the schedule panel only schedules Conference
  // rooms today. Kept as state to remain compatible with future room types.
  const [scheduledRoomType, setScheduledRoomType] = useState<RoomType>(RoomType.Standard);

  const handleScheduleRoom = () => {
    if (!loginUserInfo?.userId) {
      Toast.error({ message: t('Button.PleaseLoginFirst') });
      return;
    }
    setShowSchedulePanel(true);
  };

  const handleCancel = () => {
    setShowSchedulePanel(false);
  };

  const handleConfirm = (roomId: string, scheduleOptions: ScheduleRoomOptions) => {
    setShowSchedulePanel(false);
    setScheduledRoomId(roomId);
    setScheduledPassword(scheduleOptions.password || '');
    setScheduledRoomType(RoomType.Standard);
    setShowSuccessDialog(true);
  };

  return (
    <div className={styles.roomButton}>
      <TUIButton
        className={styles.button}
        size="large"
        type="primary"
        icon={<IconScheduleRoom />}
        onClick={handleScheduleRoom}
      >
        {t('Button.ScheduleRoom')}
      </TUIButton>

      <TUIDialog
        visible={showSchedulePanel}
        title={t('Button.ScheduleMeeting')}
        showConfirm={false}
        showCancel={false}
        teleported={false}
        onClose={handleCancel}
      >
        {showSchedulePanel && (
          <ScheduleRoomPanel
            visible={showSchedulePanel}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        )}
      </TUIDialog>

      <RoomInviteSuccessDialog
        visible={showSuccessDialog}
        roomId={scheduledRoomId}
        password={scheduledPassword}
        roomType={scheduledRoomType}
        onClose={() => setShowSuccessDialog(false)}
      />
    </div>
  );
}
