import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  TUIButton,
  IconEnterRoom,
  TUIInput,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import styles from './JoinRoomButton.module.scss';

export interface JoinRoomButtonProps {
  onJoinRoom?: (roomId: string) => void;
}

export function JoinRoomButton({ onJoinRoom }: JoinRoomButtonProps) {
  const { t } = useUIKit();
  const [inputVisible, setInputVisible] = useState(false);
  const [roomId, setRoomId] = useState('');

  const showInput = () => {
    setInputVisible(true);
  };

  const handleJoinRoom = () => {
    onJoinRoom?.(roomId);
  };

  return (
    <div className={styles.roomButton}>
      {!inputVisible
        ? (
          <TUIButton
            className={styles.button}
            type="primary"
            size="large"
            icon={<IconEnterRoom />}
            onClick={showInput}
          >
            {t('Button.JoinRoom')}
          </TUIButton>
        )
        : (
          <TUIInput
            className={styles.input}
            size="large"
            placeholder={t('Button.EnterRoomId')}
            border={false}
            value={roomId}
            onInput={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setRoomId(e.target.value)}
            onDone={handleJoinRoom}
            suffix={<IconEnterRoom size="24" onClick={handleJoinRoom} />}
          />
        )}
    </div>
  );
}
