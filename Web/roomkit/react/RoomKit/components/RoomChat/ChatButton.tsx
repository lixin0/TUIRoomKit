import { useEffect, useRef, useState } from 'react';
import {
  TUIBadge,
  IconChat,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  useChatContext,
} from 'tuikit-atomicx-react/chat';
import { useLoginState, useRoomState } from 'tuikit-atomicx-react/room';
import { BuiltinWidget } from '../../adapter/type';
import { useRoomSidePanel } from '../../hooks/useRoomSidePanel';
import { IconButton } from '../base/IconButton';

export function ChatButton() {
  const { t } = useUIKit();
  const { activeId, togglePanel } = useRoomSidePanel();
  const isActive = activeId === BuiltinWidget.RoomChatWidget;

  const { setActiveConversation, activeConversationID, messageListOnEvent } = useChatContext();
  const { currentRoom } = useRoomState();
  const { loginUserInfo } = useLoginState();

  const [unreadCount, setUnreadCount] = useState(0);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Subscribe to new message events, mirrors MessageList.tsx messageListOnEvent usage.
  // Re-subscribe whenever the active conversation changes.
  useEffect(() => {
    if (!activeConversationID || !messageListOnEvent) {
      return undefined;
    }
    const unsub = messageListOnEvent((event) => {
      if (event.type !== 'onReceiveNewMessage') {
        return;
      }
      const { message } = event;
      if (message.isSentBySelf || isActiveRef.current) {
        return;
      }
      setUnreadCount(prev => prev + 1);
    });
    return unsub;
  }, [activeConversationID, messageListOnEvent]);

  // Clear unread count when the panel opens.
  useEffect(() => {
    if (isActive) {
      setUnreadCount(0);
    }
  }, [isActive]);

  // Bind / clear the active conversation as the room changes (mirrors Vue's
  // watch on currentRoom.roomId with `immediate: true`).
  useEffect(() => {
    const roomId = currentRoom?.roomId;
    setUnreadCount(0);
    if (!loginUserInfo?.userId) {
      return;
    }
    if (!roomId) {
      setActiveConversation('');
      return;
    }
    setActiveConversation(`GROUP${roomId}`);
  }, [currentRoom?.roomId, loginUserInfo?.userId, setActiveConversation]);

  // Clear the active conversation when the button unmounts.
  useEffect(
    () => () => {
      setActiveConversation('');
    },
    [setActiveConversation],
  );

  const handleClick = () => {
    setUnreadCount(0);
    togglePanel(BuiltinWidget.RoomChatWidget);
  };

  return (
    <IconButton title={t('Chat.Title')} onClickIcon={handleClick}>
      <TUIBadge value={unreadCount} hidden={!unreadCount}>
        <IconChat size="24" />
      </TUIBadge>
    </IconButton>
  );
}
