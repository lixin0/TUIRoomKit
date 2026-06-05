import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { IconFile } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { MessageContentType, useChatUIState } from 'tuikit-atomicx-react/chat';
import styles from './FilePicker.module.scss';

const ACCEPT_TYPE = '*/*';

export interface FilePickerProps {
  /** Accessible label for the picker button. */
  label?: string;
  /** Icon size passed to `IconFile`. Defaults to `20`. */
  iconSize?: number;
  /** When true, disables file selection. */
  disabled?: boolean;
  /** Extra class names on the button element. */
  className?: string;
}

/**
 * Conference-room file picker. Mirrors Vue `FilePicker.vue` behavior and styles.
 */
export function FilePicker({
  label,
  iconSize = 20,
  disabled = false,
  className,
}: FilePickerProps) {
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
    // React MessageInputState expects `{ file }` wrapper (see uikit FilePicker).
    sendInputMessage([{ type: MessageContentType.FILE, content: { file } }]);
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
        <IconFile size={iconSize} className={styles.icon} />
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
