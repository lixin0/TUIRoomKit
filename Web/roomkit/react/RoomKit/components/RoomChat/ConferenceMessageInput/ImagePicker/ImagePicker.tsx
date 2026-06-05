import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import {
  IconImage,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { MessageContentType, useChatUIState } from 'tuikit-atomicx-react/chat';
import styles from './ImagePicker.module.scss';

const ACCEPT_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/bmp',
  'image/png',
  'image/webp',
];

function validFileType(file: File) {
  return ACCEPT_FILE_TYPES.includes(file.type);
}

export interface ImagePickerProps {
  /** Accessible label for the picker button. */
  label?: string;
  /** Icon size passed to `IconImage`. Defaults to `20`. */
  iconSize?: number;
  /** When true, disables image selection. */
  disabled?: boolean;
  /** Extra class names on the button element. */
  className?: string;
}

/**
 * Conference-room image picker. Mirrors Vue `ImagePicker.vue` behavior and styles.
 */
export function ImagePicker({
  label,
  iconSize = 20,
  disabled = false,
  className,
}: ImagePickerProps) {
  const { t } = useUIKit();
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

    if (!validFileType(file)) {
      Toast.error({
        message: t('MessageInput.invalid_image_type'),
      });
      return;
    }

    sendInputMessage([{ type: MessageContentType.IMAGE, content: file }]);
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
        <IconImage size={iconSize} className={styles.icon} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_FILE_TYPES.join(',')}
        className={styles.hiddenInput}
        onChange={handleFileInput}
      />
    </div>
  );
}
