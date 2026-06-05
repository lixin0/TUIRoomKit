import { useRef, useState } from 'react';
import { TUIErrorCode } from '@tencentcloud/tuiroom-engine-js';
import {
  IconCameraOff,
  IconCameraOn,
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
  VideoSettingPanel,
  useDeviceState,
  useRoomModal,
  useRoomParticipantState,
  useRoomState,
} from 'tuikit-atomicx-react/room';
import { IconButton } from '../base/IconButton';
import { useClickOutside } from '../base/useClickOutside';
import styles from './CameraButton.module.scss';

const ERROR_SPEAKER_LIMIT_EXCEEDED = 100253;

export interface CameraButtonProps {
  /** Optional preview container used by `startCameraTest` before joining a room. */
  cameraTestContainer?: HTMLDivElement | string;
}

export function CameraButton({ cameraTestContainer }: CameraButtonProps) {
  const { t } = useUIKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showVideoSettingTab, setShowVideoSettingTab] = useState(false);

  const {
    cameraStatus,
    cameraLastError,
    isCameraTesting,
    startCameraTest,
    stopCameraTest,
    openLocalCamera,
    closeLocalCamera,
  } = useDeviceState();
  const { currentRoom } = useRoomState();
  const { localParticipant, participantList } = useRoomParticipantState();
  const { handleErrorWithModal } = useRoomModal();

  const isOwnerOrAdmin
    = localParticipant?.role === RoomParticipantRole.Owner
      || localParticipant?.role === RoomParticipantRole.Admin;
  const isCameraOn = cameraStatus === DeviceStatus.On;
  const isCameraDisabled
    = !isOwnerOrAdmin && !isCameraOn && Boolean(currentRoom?.isAllCameraDisabled);

  const isWebinar = currentRoom?.roomType === RoomType.Webinar;
  const localUserId = localParticipant?.userId;
  const localRole = localParticipant?.role ?? RoomParticipantRole.GeneralUser;

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

  const isHigherRoleParticipantPublishingInWebinar
    = isWebinar
      && participantList.some(
        p =>
          p.userId !== localUserId
          && p.cameraStatus === DeviceStatus.On
          && isRoleEqualOrHigher(p.role),
      );

  const isLowerRoleParticipantPublishingInWebinar
    = isWebinar
      && participantList.some(
        p =>
          p.userId !== localUserId
          && p.cameraStatus === DeviceStatus.On
          && !isRoleEqualOrHigher(p.role),
      );

  const hasNotSupportError = cameraLastError !== DeviceError.NoError;

  const isCameraActive = currentRoom ? isCameraOn : isCameraTesting;
  const title = isCameraActive ? t('Camera.Stop') : t('Camera.Start');

  useClickOutside(containerRef, () => {
    if (showVideoSettingTab) {
      setShowVideoSettingTab(false);
    }
  });

  function handleErrorWithToast(error: { code?: number } | unknown) {
    let message = t('Camera.UnknownError');
    switch (cameraLastError) {
      case DeviceError.NotSupportCapture:
        message = t('Camera.NotSupportCapture');
        break;
      case DeviceError.NoSystemPermission:
        message = t('Camera.NoSystemPermission');
        break;
      case DeviceError.OccupiedError:
        message = t('Camera.OccupiedError');
        break;
      case DeviceError.NoDeviceDetected:
        message = t('Camera.NoDeviceDetected');
        break;
      default:
        break;
    }
    const err = error as { code?: number } | undefined;
    switch (err?.code) {
      case ERROR_SPEAKER_LIMIT_EXCEEDED:
        message = t('Camera.HigherRoleParticipantPublishingInWebinar');
        break;
      case TUIErrorCode.ERR_FREQ_LIMIT:
        message = t('RoomCommon.FrequencyLimit');
        break;
      default:
        break;
    }
    Toast.warning({ message });
  }

  // TODO: handle rapid repeated clicks; needs optimization (parity with Vue source).
  async function handleClickIcon() {
    try {
      if (isCameraDisabled) {
        Toast.warning({ message: t('Camera.Disabled') });
        return;
      }
      if (isHigherRoleParticipantPublishingInWebinar) {
        Toast.warning({
          message: t('Camera.HigherRoleParticipantPublishingInWebinar'),
        });
        return;
      }
      if (!currentRoom && cameraTestContainer) {
        if (isCameraTesting) {
          await stopCameraTest();
        } else {
          await startCameraTest({ view: cameraTestContainer });
        }
        return;
      }
      if (cameraStatus === DeviceStatus.On) {
        await closeLocalCamera();
      } else if (isLowerRoleParticipantPublishingInWebinar) {
        MessageBox.confirm({
          title: t('Camera.SomeonePresentingTitle'),
          content: t('Camera.SomeonePresentingConfirm'),
          callback: async (action) => {
            if (action === 'confirm') {
              try {
                await openLocalCamera();
              } catch (error) {
                handleErrorWithModal(error as { code?: number; message?: string });
                handleErrorWithToast(error);
              }
            }
          },
        });
      } else {
        await openLocalCamera();
      }
    } catch (error) {
      handleErrorWithModal(error as { code?: number; message?: string });
      handleErrorWithToast(error);
    }
  }

  function handleMore() {
    setShowVideoSettingTab(prev => !prev);
  }

  const renderCameraIcon = () => {
    if (!currentRoom) {
      return isCameraTesting ? <IconCameraOn size="24" /> : <IconCameraOff size="24" />;
    }
    return cameraStatus === DeviceStatus.On
      ? (
        <IconCameraOn size="24" />
      )
      : (
        <IconCameraOff size="24" />
      );
  };

  return (
    <div ref={containerRef} className={styles.videoControl}>
      <IconButton
        title={title}
        hasMore
        disabled={isCameraDisabled}
        onClickIcon={handleClickIcon}
        onClickMore={handleMore}
      >
        <div className={styles.videoIconContainer}>
          {renderCameraIcon()}
          {hasNotSupportError && (
            <IconUnSupport className={styles.unSupportIcon} size="14" />
          )}
        </div>
      </IconButton>
      <div
        className={styles.videoTab}
        style={{ display: showVideoSettingTab ? undefined : 'none' }}
      >
        <VideoSettingPanel videoPreviewVisible={false} />
      </div>
    </div>
  );
}
