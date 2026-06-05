import classNames from 'classnames';
import styles from './ConferenceMessageInput.module.scss';
import { EmojiPicker } from './EmojiPicker';
import { FilePicker } from './FilePicker';
import { ImagePicker } from './ImagePicker';
import { VideoPicker } from './VideoPicker';

export interface ConferenceMessageInputToolbarProps {
  /** When true, disables toolbar interactions. */
  disabled?: boolean;
}

/**
 * Top toolbar for conference chat input. Mirrors Vue MessageInput default
 * actions (without QuickConferencePicker).
 */
export function ConferenceMessageInputToolbar({
  disabled = false,
}: ConferenceMessageInputToolbarProps) {
  return (
    <div
      className={classNames(styles.toolbar, { [styles.toolbarDisabled]: disabled })}
      aria-disabled={disabled || undefined}
    >
      <EmojiPicker disabled={disabled} />
      <ImagePicker disabled={disabled} />
      <FilePicker disabled={disabled} />
      <VideoPicker disabled={disabled} />
    </div>
  );
}
