import { useEffect, useRef, useState } from 'react';
import { IconEmoji, useUIKit } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { MessageContentType, useChatUIState } from 'tuikit-atomicx-react/chat';
import { emojiBaseUrl, emojiUrlMap } from './emojiConstants';
import styles from './EmojiPicker.module.scss';
import { transformTextWithEmojiKeyToName } from './emojiUtils';

export interface EmojiPickerProps {
  /** Accessible label for the picker button. */
  label?: string;
  /** Icon size passed to `IconEmoji`. Defaults to `20`. */
  iconSize?: number;
  /** When true, disables opening the emoji panel. */
  disabled?: boolean;
  /** Extra class names on the trigger button. */
  className?: string;
}

/**
 * Conference-room emoji picker with a custom smooth popup.
 */
export function EmojiPicker({
  label,
  iconSize = 20,
  disabled = false,
  className,
}: EmojiPickerProps) {
  const { t } = useUIKit();
  const { insertInputContent } = useChatUIState();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Object.values(emojiUrlMap).forEach((url) => {
      const img = new Image();
      img.src = emojiBaseUrl + url;
    });
  }, []);

  function openPopup() {
    clearTimeout(closeTimerRef.current);
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  }

  function closePopup() {
    setVisible(false);
    closeTimerRef.current = setTimeout(() => setMounted(false), 220);
  }

  function togglePopup() {
    if (disabled) {
      return;
    }
    if (mounted) {
      closePopup();
    } else {
      openPopup();
    }
  }

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node)
        || popupRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      closePopup();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  useEffect(() => {
    clearTimeout(closeTimerRef.current);
  }, []);

  function insertEmojiToInput(emojiKey: string) {
    if (!emojiKey) {
      return;
    }
    insertInputContent([{
      type: MessageContentType.EMOJI,
      content: {
        url: emojiBaseUrl + emojiUrlMap[emojiKey],
        key: emojiKey,
        text: transformTextWithEmojiKeyToName(emojiKey),
      },
    }]);
    closePopup();
  }

  const popup = mounted
    ? (
      <div
        ref={popupRef}
        className={classNames(styles.popup, { [styles.popupVisible]: visible })}
      >
        <div className={styles.list}>
          {Object.keys(emojiUrlMap).map(emojiKey => (
            <div
              key={emojiKey}
              className={styles.listItem}
              onMouseDown={e => e.preventDefault()}
              onClick={() => insertEmojiToInput(emojiKey)}
            >
              <img
                src={emojiBaseUrl + emojiUrlMap[emojiKey]}
                alt={t(`Emoji.${emojiKey}`)}
              />
            </div>
          ))}
        </div>
      </div>
    )
    : null;

  return (
    <div className={styles.wrapper}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={classNames(styles.button, className, { [styles.disabled]: disabled })}
        aria-label={label}
        aria-expanded={mounted && visible}
        aria-disabled={disabled || undefined}
        onClick={togglePopup}
      >
        <IconEmoji size={`${iconSize}px`} className={styles.icon} />
      </div>
      {popup}
    </div>
  );
}
