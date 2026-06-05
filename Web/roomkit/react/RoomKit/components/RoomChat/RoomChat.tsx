import { useEffect, useRef } from 'react';
import { useUIKit } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { MessageList, useMessageActions } from 'tuikit-atomicx-react/chat';
import { useRoomParticipantState } from 'tuikit-atomicx-react/room';
import { ConferenceMessageInput } from './ConferenceMessageInput';
import { CustomMessage } from './CustomMessage';
import styles from './RoomChat.module.scss';
import type { MessageListHandle } from 'tuikit-atomicx-react/chat';

export interface RoomChatProps {
  /** Whether the chat panel is currently active/visible. */
  isActive?: boolean;
  /** When true, hide the root with CSS instead of unmounting while inactive. */
  keepAlive?: boolean;
}

export function RoomChat({ isActive = false, keepAlive = false }: RoomChatProps) {
  const { t } = useUIKit();
  const { localParticipant } = useRoomParticipantState();

  const placeholder = localParticipant?.isMessageDisabled
    ? t('RoomChat.disabled_placeholder')
    : t('RoomChat.input_placeholder');

  const messageActionList = useMessageActions(['copy', 'recall', 'delete']);

  const messageListRef = useRef<MessageListHandle>(null);
  const wasActiveRef = useRef(isActive);
  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      messageListRef.current?.scrollToBottom('instant');
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  const isHidden = keepAlive && !isActive;

  return (
    <div
      className={classNames(styles.roomChat, { [styles.roomChatHidden]: isHidden })}
      aria-hidden={isHidden || undefined}
    >
      <MessageList
        ref={messageListRef}
        className={styles.roomMessageList}
        Message={CustomMessage}
        messageActionList={messageActionList}
      />
      <ConferenceMessageInput
        className={styles.roomMessageInput}
        placeholder={placeholder}
        disabled={localParticipant?.isMessageDisabled}
      />
    </div>
  );
}
