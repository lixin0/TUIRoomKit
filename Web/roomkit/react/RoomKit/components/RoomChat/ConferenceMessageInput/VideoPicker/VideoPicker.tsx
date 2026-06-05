import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { IconVideo } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { useChatUIState } from 'tuikit-atomicx-react/chat';
import styles from './VideoPicker.module.scss';

const ACCEPT_TYPE = '.mp4,.mov,.qt';

export interface VideoPickerProps {
  /** Accessible label for the picker button. */
  label?: string;
  /** Icon size passed to `IconVideo`. Defaults to `20`. */
  iconSize?: number;
  /** When true, disables video selection. */
  disabled?: boolean;
  /** Extra class names on the button element. */
  className?: string;
}

/**
 * Conference-room video picker. Mirrors Vue `VideoPicker.vue` behavior and styles.
 */
export function VideoPicker({
  label,
  iconSize = 20,
  disabled = false,
  className,
}: VideoPickerProps) {
  const { sendInputMessage } = useChatUIState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleButtonClick() {
    if (disabled) {
      return;
    }
    fileInputRef.current?.click();
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    sendInputMessage([{ type: 'video', content: file }]);
    input.value = '';
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={classNames(styles.button, className, {
          [styles.disabled]: disabled,
        })}
        aria-label={label}
        aria-disabled={disabled || undefined}
        onClick={handleButtonClick}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleButtonClick();
          }
        }}
      >
        <IconVideo size={iconSize} className={styles.icon} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_TYPE}
        className={styles.hiddenInput}
        onChange={handleFileInput}
      />
    </div>
  );
}
