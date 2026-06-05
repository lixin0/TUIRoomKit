import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Button,
  Input,
  TUIDialog,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { useRoomState } from 'tuikit-atomicx-react/room';
import styles from './PasswordDialog.module.scss';

export interface PasswordDialogProps {
  /**
   * Controlled visibility of the dialog. Equivalent to Vue's `v-model`.
   */
  visible: boolean;
  /**
   * Fired whenever the dialog wants to change its own visibility (cancel /
   * confirm-success). Equivalent to Vue's `update:modelValue` emit.
   */
  onVisibleChange: (visible: boolean) => void;
  /**
   * Room to join once the password is entered.
   */
  roomId: string;
  /**
   * Fired after `joinRoom` resolves successfully. Equivalent to Vue's
   * `@success` emit.
   */
  onSuccess?: (data: { roomId: string; password: string }) => void;
  /**
   * Fired when the user cancels the dialog. Equivalent to Vue's `@cancel`.
   */
  onCancel?: () => void;
  /**
   * Fired when `joinRoom` rejects. Equivalent to Vue's `@error`.
   */
  onError?: (error: unknown) => void;
}

export function PasswordDialog(props: PasswordDialogProps) {
  const {
    visible,
    onVisibleChange,
    roomId,
    onSuccess,
    onCancel,
    onError,
  } = props;
  const { t } = useUIKit();
  const { joinRoom } = useRoomState();

  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Vue's `watch(visible, ...)` clears the password whenever the dialog hides.
  // Replicate that here so the next open starts from a clean slate.
  useEffect(() => {
    if (!visible) {
      setPassword('');
    }
  }, [visible]);

  const closeDialog = () => {
    onVisibleChange(false);
    setPassword('');
  };

  const handleConfirm = async () => {
    if (!password) {
      Toast.error({ message: t('Room.EnterPassword') });
      return;
    }
    if (isJoining) {
      return;
    }
    try {
      setIsJoining(true);
      await joinRoom({ roomId, password });
      const joinedPassword = password;
      closeDialog();
      onSuccess?.({ roomId, password: joinedPassword });
    } catch (error) {
      console.error('Failed to join room with password:', error);
      onError?.(error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    closeDialog();
    onCancel?.();
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <TUIDialog
      visible={visible}
      title={t('Room.EnterPassword')}
      showClose={false}
      showConfirm={false}
      showCancel={false}
      modal={false}
      teleported={false}
      onClose={handleCancel}
    >
      <Input
        value={password}
        type="number"
        showPassword
        maxLength={6}
        placeholder={t('Room.EnterPasswordPlaceholder')}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.buttonContainer}>
        <Button
          type="primary"
          style={{ minWidth: '88px' }}
          loading={isJoining}
          onClick={handleConfirm}
        >
          {t('Room.Confirm')}
        </Button>
        <Button
          style={{ minWidth: '88px' }}
          onClick={handleCancel}
        >
          {t('Room.Cancel')}
        </Button>
      </div>
    </TUIDialog>
  );
}

export default PasswordDialog;
