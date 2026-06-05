import {
  IconCreateRoom,
  TUIButton,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { RoomType } from 'tuikit-atomicx-react/room';
import styles from './StartRoomButton.module.scss';

export interface StartRoomButtonProps {
  /** Fired when the user picks a room type from the dropdown. */
  onStartRoom?: (roomType: RoomType) => void;
}

export function StartRoomButton({ onStartRoom }: StartRoomButtonProps) {
  const { t } = useUIKit();

  const handleStartRoom = (roomType: RoomType) => {
    onStartRoom?.(roomType);
  };

  return (
    <div className={styles.roomButton}>
      <TUIButton
        className={styles.button}
        size="large"
        type="primary"
        icon={<IconCreateRoom />}
        onClick={() => handleStartRoom(RoomType.Standard)}
      >
        {t('Button.CreateRoom')}
      </TUIButton>
    </div>
  );
}
