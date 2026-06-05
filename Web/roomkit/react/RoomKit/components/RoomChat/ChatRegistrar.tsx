import { useEffect } from 'react';
import { useUIKit } from '@tencentcloud/uikit-base-component-react';
import { BuiltinWidget } from '../../adapter/type';
import { useRoomSidePanel } from '../../hooks/useRoomSidePanel';
import { ChatButton } from './ChatButton';
import { RoomChat } from './RoomChat';

/**
 * Registration-only component: mounts the chat panel into the side panel store.
 * Mirrors Vue `ChatRegistrar.vue` (empty template, register on mount).
 */
export function ChatRegistrar() {
  const { t } = useUIKit();
  const { registerSidePanel } = useRoomSidePanel();

  useEffect(
    () => registerSidePanel({
      id: BuiltinWidget.RoomChatWidget,
      title: () => t('Chat.Title'),
      keepAlive: true,
      render: ({ isActive, keepAlive }) => (
        <RoomChat isActive={isActive} keepAlive={keepAlive} />
      ),
    }),
    [registerSidePanel, t],
  );

  return <ChatButton />;
}
