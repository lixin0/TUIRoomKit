import {
  VideoStreamType,
  useRoomParticipantState,
} from 'tuikit-atomicx-react/room';
import { LocalScreenViewUI } from './LocalScreenViewUI';
import { ParticipantViewUI } from './ParticipantViewUI';
import type { RoomParticipant } from 'tuikit-atomicx-react/room';

export interface StandardParticipantViewUIProps {
  /** Participant whose stream is being decorated. May be `null` for placeholder tiles. */
  participant?: RoomParticipant | null;
  /** Stream type of the underlying tile (camera or screen share). */
  streamType: VideoStreamType;
}

export function StandardParticipantViewUI({
  participant,
  streamType,
}: StandardParticipantViewUIProps) {
  const { localParticipant } = useRoomParticipantState();

  const isLocalScreen
    = participant?.userId === localParticipant?.userId
      && streamType === VideoStreamType.Screen;

  if (isLocalScreen) {
    return <LocalScreenViewUI />;
  }

  if (participant) {
    return <ParticipantViewUI participant={participant} streamType={streamType} />;
  }

  return null;
}
