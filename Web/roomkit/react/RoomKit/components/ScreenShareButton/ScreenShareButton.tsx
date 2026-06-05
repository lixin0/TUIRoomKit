import { TUIErrorCode } from '@tencentcloud/tuiroom-engine-js';
import {
  IconScreenShare,
  IconStopScreenShare,
  IconUnSupport,
  MessageBox,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  DeviceError,
  DeviceStatus,
  RoomParticipantRole,
  RoomType,
  useDeviceState,
  useRoomParticipantState,
  useRoomState,
} from 'tuikit-atomicx-react/room';
import { conference } from '../../adapter/conference';
import { InterceptorAction } from '../../adapter/type';
import { IconButton } from '../base/IconButton';
import styles from './ScreenShareButton.module.scss';

const ERROR_SPEAKER_LIMIT_EXCEEDED = 100253;

export function ScreenShareButton() {
  const { t } = useUIKit();
  const { currentRoom } = useRoomState();
  const { localParticipant, participantWithScreen, participantList } = useRoomParticipantState();
  const { screenStatus, screenLastError, startScreenShare, stopScreenShare } = useDeviceState();

  const isLocalScreenShareUser
    = !!participantWithScreen
      && participantWithScreen.userId === localParticipant?.userId;
  const isScreenShareDisabled
    = !!currentRoom?.isAllScreenShareDisabled
      && localParticipant?.role === RoomParticipantRole.GeneralUser
      && !isLocalScreenShareUser;

  const localRole = localParticipant?.role ?? RoomParticipantRole.GeneralUser;
  const localUserId = localParticipant?.userId;

  function isRoleEqualOrHigher(participantRole: RoomParticipantRole): boolean {
    if (localRole === RoomParticipantRole.GeneralUser) {
      return true;
    }
    if (localRole === RoomParticipantRole.Admin) {
      return (
        participantRole === RoomParticipantRole.Owner
        || participantRole === RoomParticipantRole.Admin
      );
    }
    return participantRole === RoomParticipantRole.Owner;
  }

  const isWebinar = currentRoom?.roomType === RoomType.Webinar;

  const isHigherRoleParticipantPublishingInWebinar
    = isWebinar
      && participantList.some(
        participant =>
          participant.userId !== localUserId
          && participant.cameraStatus === DeviceStatus.On
          && isRoleEqualOrHigher(participant.role),
      );

  const isLowerRoleParticipantPublishingInWebinar
    = isWebinar
      && participantList.some(
        participant =>
          participant.userId !== localUserId
          && participant.cameraStatus === DeviceStatus.On
          && !isRoleEqualOrHigher(participant.role),
      );

  async function handleStartScreenShare() {
    try {
      await startScreenShare({ screenAudio: true });
    } catch (error: unknown) {
      const err = error as { code?: number; name?: string; message?: string };
      let message = t('ScreenShare.UnknownErrorOccurredWhileSharing');
      switch (err.name) {
        case 'NotReadableError':
          message = t('ScreenShare.SystemProhibitsAccessScreenContent');
          break;
        case 'NotAllowedError':
          if (err.message?.includes('Permission denied by system')) {
            message = t('ScreenShare.SystemProhibitsAccessScreenContent');
          } else {
            message = t('ScreenShare.UserCanceledScreenSharing');
          }
          break;
        default:
          break;
      }
      if (err.code === TUIErrorCode.ERR_OPEN_SCREEN_SHARE_NEED_PERMISSION_FROM_ADMIN) {
        message = t('ScreenShare.NotAllowedToShareScreen');
      }
      if (err.code === ERROR_SPEAKER_LIMIT_EXCEEDED) {
        message = t('ScreenShare.HigherRoleParticipantPublishingInWebinar');
      }
      if (err.code === TUIErrorCode.ERR_FREQ_LIMIT) {
        message = t('RoomCommon.FrequencyLimit');
      }
      Toast.warning({ message });
    }
  }

  async function doStartScreenShare() {
    await conference.executeInterceptor(InterceptorAction.StartScreenShare, () => {
      MessageBox.confirm({
        title: t('ScreenShare.StartSharing'),
        content: t('ScreenShare.StartSharingConfirm'),
        callback: async (action) => {
          if (action === 'confirm') {
            await handleStartScreenShare();
          }
        },
      });
    });
  }

  async function handleScreenShare() {
    if (screenStatus === DeviceStatus.On) {
      await conference.executeInterceptor(InterceptorAction.StopScreenShare, () => {
        MessageBox.confirm({
          title: t('ScreenShare.EndSharing'),
          content: t('ScreenShare.StopSharingConfirm'),
          callback: async (action) => {
            if (action === 'confirm') {
              await stopScreenShare();
            }
          },
        });
      });
      return;
    }
    if (isScreenShareDisabled) {
      Toast.warning({ message: t('ScreenShare.NotAllowedToShareScreen') });
      return;
    }
    if (participantWithScreen) {
      Toast.warning({ message: t('ScreenShare.AnotherIsSharingTheScreen') });
      return;
    }
    if (screenLastError === DeviceError.NotSupportCapture) {
      Toast.warning({
        message: t('ScreenShare.BrowserDoesNotSupportScreenSharing'),
      });
      return;
    }
    if (isHigherRoleParticipantPublishingInWebinar) {
      Toast.warning({
        message: t('ScreenShare.HigherRoleParticipantPublishingInWebinar'),
      });
      return;
    }
    if (isLowerRoleParticipantPublishingInWebinar) {
      MessageBox.confirm({
        title: t('ScreenShare.SomeonePresentingTitle'),
        content: t('ScreenShare.SomeonePresentingConfirm'),
        callback: async (action) => {
          if (action === 'confirm') {
            await doStartScreenShare();
          }
        },
      });
      return;
    }
    await doStartScreenShare();
  }

  return (
    <IconButton
      title={t('ScreenShare.Title')}
      disabled={isScreenShareDisabled}
      onClickIcon={handleScreenShare}
    >
      {screenStatus === DeviceStatus.On && <IconStopScreenShare size="24" />}
      {screenStatus === DeviceStatus.Off && <IconScreenShare size="24" />}
      {screenLastError !== DeviceError.NoError && (
        <IconUnSupport className={styles.unSupportIcon} size="14" />
      )}
    </IconButton>
  );
}
