import type { CSSProperties } from 'react';
import { IconMicOff, IconMicOn } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import styles from './AudioIcon.module.scss';

export interface AudioIconProps {
  /** Local user ID. Reserved for participant-level audio metering. */
  userId?: string;
  /** Volume level (0-100). Drives the green level bar height when not muted. */
  audioVolume?: number;
  /** When true, renders the muted microphone icon and hides the level bar. */
  isMuted?: boolean;
  /** Size variant. `small` scales the icon down to 80%. */
  size?: 'small';
  /** Reserved for future disabled state styling. */
  isDisabled?: boolean;
}

export function AudioIcon({
  audioVolume,
  isMuted = false,
  size,
}: AudioIconProps) {
  const audioLevelStyle: CSSProperties | undefined
    = !isMuted && audioVolume ? { height: `${audioVolume * 4}%` } : undefined;

  return (
    <div
      className={classNames(styles.audioIcon, { [styles.small]: size === 'small' })}
    >
      <div className={styles.levelContainer}>
        <div className={styles.level} style={audioLevelStyle} />
      </div>
      {isMuted
        ? (
          <IconMicOff className={styles.icon} size="24" />
        )
        : (
          <IconMicOn className={styles.icon} size="24" />
        )}
    </div>
  );
}
