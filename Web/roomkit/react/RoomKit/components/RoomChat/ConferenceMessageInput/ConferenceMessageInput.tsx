import { useMemo } from 'react';
import classNames from 'classnames';
import { MessageInput } from 'tuikit-atomicx-react/chat';
import styles from './ConferenceMessageInput.module.scss';
import { ConferenceMessageInputToolbar } from './ConferenceMessageInputToolbar';

export interface ConferenceMessageInputProps {
  /** Input placeholder text. */
  placeholder?: string;
  /** When true, disables the text editor and toolbar. */
  disabled?: boolean;
  /** Extra class names merged onto the MessageInput root. */
  className?: string;
  /** Maximum character length for the text editor. */
  maxLength?: number;
}

/**
 * Conference-room chat input with Vue MessageInput default layout:
 * toolbar on top, editor below, no send button (Enter to send).
 */
export function ConferenceMessageInput({
  placeholder,
  disabled = false,
  className,
  maxLength,
}: ConferenceMessageInputProps) {
  const slots = useMemo(
    () => ({
      headerToolbar: () => (
        <ConferenceMessageInputToolbar disabled={disabled} />
      ),
      // // Empty fragment prevents default leftInline toolbar from rendering.
      leftInline: () => null,
      rightInline: () => null,
    }),
    [disabled],
  );

  return (
    <MessageInput
      className={classNames(styles.conferenceMessageInput, className)}
      hideSendButton
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      slots={slots}
    />
  );
}
