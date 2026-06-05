import { useRef, useState } from 'react';
import {
  IconUnSupport,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  AudioSettingPanel,
  DeviceError,
  DeviceStatus,
  RoomParticipantRole,
  useDeviceState,
  useRoomModal,
  useRoomParticipantState,
  useRoomState,
} from 'tuikit-atomicx-react/room';
import { IconButton } from '../base/IconButton';
import { useClickOutside } from '../base/useClickOutside';
import { AudioIcon } from './AudioIcon';
import styles from './MicButton.module.scss';

export function MicButton() {
  const { t } = useUIKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAudioSettingTab, setShowAudioSettingTab] = useState(false);

  const {
    currentMicVolume,
    testingMicVolume,
    microphoneStatus,
    microphoneLastError,
    isMicrophoneTesting,
    openLocalMicrophone,
    startMicrophoneTest,
    stopMicrophoneTest,
  } = useDeviceState();
  const { currentRoom } = useRoomState();
  const { localParticipant, muteMicrophone, unmuteMicrophone } = useRoomParticipantState();
  const { handleErrorWithModal } = useRoomModal();

  const isOwnerOrAdmin
    = localParticipant?.role === RoomParticipantRole.Owner
      || localParticipant?.role === RoomParticipantRole.Admin;
  const isMicrophoneOn = microphoneStatus === DeviceStatus.On;
  const isMicrophoneDisabled
    = !isOwnerOrAdmin && !isMicrophoneOn && Boolean(currentRoom?.isAllMicrophoneDisabled);

  const isMuted = currentRoom
    ? microphoneStatus !== DeviceStatus.On
    : !isMicrophoneTesting;

  const hasNotSupportError = microphoneLastError !== DeviceError.NoError;

  useClickOutside(containerRef, () => {
    if (showAudioSettingTab) {
      setShowAudioSettingTab(false);
    }
  });

  function handleErrorWithToast() {
    if (microphoneLastError === DeviceError.NoError) {
      return;
    }
    let message: string;
    switch (microphoneLastError) {
      case DeviceError.NotSupportCapture:
        message = t('Microphone.NotSupportCapture');
        break;
      case DeviceError.NoSystemPermission:
        message = t('Microphone.NoSystemPermission');
        break;
      case DeviceError.OccupiedError:
        message = t('Microphone.OccupiedError');
        break;
      case DeviceError.NoDeviceDetected:
        message = t('Microphone.NoDeviceDetected');
        break;
      default:
        message = t('Microphone.UnknownError');
        break;
    }
    Toast.warning({ message });
  }

  async function handleClickIcon() {
    try {
      if (isMicrophoneDisabled) {
        Toast.warning({ message: t('Microphone.Disabled') });
        return;
      }
      if (!currentRoom) {
        if (isMicrophoneTesting) {
          await stopMicrophoneTest();
        } else {
          await startMicrophoneTest({ interval: 200 });
        }
        return;
      }
      if (microphoneStatus === DeviceStatus.On) {
        await muteMicrophone();
      } else {
        await openLocalMicrophone();
        await unmuteMicrophone();
      }
    } catch (error) {
      handleErrorWithModal(error as { code?: number; message?: string });
      handleErrorWithToast();
    }
  }

  function handleMore() {
    setShowAudioSettingTab(prev => !prev);
  }

  return (
    <div ref={containerRef} className={styles.audioControl}>
      <IconButton
        title={isMuted ? t('Microphone.Unmute') : t('Microphone.Mute')}
        hasMore
        disabled={isMicrophoneDisabled}
        onClickIcon={handleClickIcon}
        onClickMore={handleMore}
      >
        <div className={styles.audioIconContainer}>
          <AudioIcon
            audioVolume={isMicrophoneTesting ? testingMicVolume : currentMicVolume}
            isMuted={isMuted}
          />
          {hasNotSupportError && (
            <IconUnSupport className={styles.unSupportIcon} size="14" />
          )}
        </div>
      </IconButton>
      <div
        className={styles.audioTab}
        style={{ display: showAudioSettingTab ? undefined : 'none' }}
      >
        <AudioSettingPanel
          micTestVisible={false}
          inputVolumeVisible={false}
          speakerTestVisible={false}
          outputVolumeVisible={false}
        />
      </div>
    </div>
  );
}
