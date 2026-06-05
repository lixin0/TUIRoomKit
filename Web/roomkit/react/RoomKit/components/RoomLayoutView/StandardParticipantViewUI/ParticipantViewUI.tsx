import {
  IconMicOff,
  IconMicOn,
  IconScreenOpen,
  IconUser,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  Avatar,
  DeviceStatus,
  RoomParticipantRole,
  VideoStreamType,
  useRoomParticipantState,
} from 'tuikit-atomicx-react/room';
import styles from './ParticipantViewUI.module.scss';
import type { RoomParticipant } from 'tuikit-atomicx-react/room';

export interface ParticipantViewUIProps {
  /** Participant whose camera or screen stream is rendered. */
  participant: RoomParticipant;
  /** Stream the cover is decorating: camera tile or screen-share tile. */
  streamType: VideoStreamType;
}

export function ParticipantViewUI({ participant, streamType }: ParticipantViewUIProps) {
  const { t } = useUIKit();
  const { speakingUsers } = useRoomParticipantState();

  const speakingAudioVolume = speakingUsers.get(participant.userId) ?? 0;
  const isActiveSpeaking = speakingAudioVolume > 0;
  const isMicMuted = participant.microphoneStatus === DeviceStatus.Off;
  const isCameraOff = participant.cameraStatus === DeviceStatus.Off;
  const isScreenStream = streamType === VideoStreamType.Screen;
  const isCameraStream = streamType === VideoStreamType.Camera;

  const audioLevelStyle
    = isMicMuted || !isActiveSpeaking
      ? undefined
      : { height: `${speakingAudioVolume * 4}%` };

  const displayName
    = participant.nameCard || participant.userName || participant.userId;

  const showMasterIcon
    = participant.role === RoomParticipantRole.Owner && isCameraStream;
  const showAdminIcon
    = participant.role === RoomParticipantRole.Admin && isCameraStream;
  const showRoleIcon = showMasterIcon || showAdminIcon;

  return (
    <div className={styles.streamCover}>
      {isCameraStream && isCameraOff && (
        <div className={styles.centerInfo}>
          <Avatar
            className={styles.avatar}
            size="xxl"
            src={participant.avatarUrl}
          />
        </div>
      )}
      <div className={styles.cornerInfo}>
        {showRoleIcon && (
          <div className={showMasterIcon ? styles.masterIcon : styles.adminIcon}>
            <IconUser />
          </div>
        )}
        {!isScreenStream && (
          <div className={styles.audioIconContainer}>
            <div className={styles.audioLevelContainer}>
              <div className={styles.audioLevel} style={audioLevelStyle} />
            </div>
            {isMicMuted
              ? <IconMicOff className={styles.audioIcon} size="20" />
              : <IconMicOn className={styles.audioIcon} size="20" />}
          </div>
        )}
        {isScreenStream && (
          <IconScreenOpen className={styles.screenIcon} size="18" />
        )}
        <span className={styles.userName} title={displayName}>
          {displayName}
        </span>
        {isScreenStream && (
          <span className={styles.screenInfo}>
            {t('RoomView.IsSharingTheirScreen')}
          </span>
        )}
      </div>
    </div>
  );
}
