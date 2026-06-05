import { useMemo } from 'react';
import type { ComponentProps } from 'react';
import { Message } from 'tuikit-atomicx-react/chat';
import { useRoomParticipantState } from 'tuikit-atomicx-react/room';

type CustomMessageProps = ComponentProps<typeof Message>;

export function CustomMessage(props: CustomMessageProps) {
  const { message } = props;
  const { participantList } = useRoomParticipantState();

  const userName = useMemo(() => {
    const participant = participantList.find(p => p.userId === message.from?.userID);
    return (
      participant?.nameCard
      || participant?.userName
      || participant?.userId
      || message.from?.nickname
      || message.from?.userID
    );
  }, [participantList, message.from?.userID, message.from?.nickname]);

  return (
    <Message
      {...props}
      nick={userName}
      removeAvatar
    />
  );
}
