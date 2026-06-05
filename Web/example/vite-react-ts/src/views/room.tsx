import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUIKit } from '@tencentcloud/uikit-base-component-react';
import {
  ConferenceMainView,
  RoomEvent as ConferenceRoomEvent,
  conference,
} from '@tencentcloud/roomkit-web-react';
import {
  RoomType,
  VideoQuality,
  useDeviceState,
  useLoginState,
  useRoomModal,
  useRoomParticipantState,
  useRoomState,
} from 'tuikit-atomicx-react/room';
import { useMediaPreference } from '@/hooks/useMediaPreference';
import { truncateByBytes } from '@/utils/utils';

const MAX_ROOM_NAME_BYTES = 100;

export default function Room() {
  const { t } = useUIKit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { loginUserInfo } = useLoginState();
  const { currentRoom } = useRoomState();
  const {
    localVideoQuality,
    openLocalCamera,
    updateVideoQuality,
    openLocalMicrophone,
  } = useDeviceState();
  const { muteMicrophone, unmuteMicrophone } = useRoomParticipantState();
  const { getMicrophonePreference, getCameraPreference } = useMediaPreference();
  const { handleErrorWithModal } = useRoomModal();

  const roomId = searchParams.get('roomId') || '';
  const password = searchParams.get('password') ?? undefined;
  const roomType = Number(searchParams.get('roomType')) as RoomType;

  const currentRoomRef = useRef(currentRoom);
  currentRoomRef.current = currentRoom;
  const loginUserInfoRef = useRef(loginUserInfo);
  loginUserInfoRef.current = loginUserInfo;
  const localVideoQualityRef = useRef(localVideoQuality);
  localVideoQualityRef.current = localVideoQuality;

  useEffect(() => {
    if (!roomId) {
      navigate('/home', { replace: true });
    }
  }, []);

  const userId = loginUserInfo?.userId;
  const hasEnteredRoomRef = useRef(false);
  useEffect(() => {
    if (!userId || !roomId || hasEnteredRoomRef.current) {
      return;
    }
    // Already inside a room (deep link / SDK retained session): skip.
    if (currentRoom?.roomId) {
      return;
    }
    hasEnteredRoomRef.current = true;

    const enterRoom = async () => {
      try {
        const isCreateKey = `room-${roomId}-isCreate`;
        const isCreate = sessionStorage.getItem(isCreateKey) === 'true';
        sessionStorage.removeItem(isCreateKey);
        if (isCreate) {
          const ownerName =
            loginUserInfo?.userName || loginUserInfo?.userId || '';
          const suffix =
            roomType === RoomType.Webinar
              ? t('Room.Webinar')
              : t('Room.TemporaryMeeting');
          const suffixBytes = new TextEncoder().encode(suffix).length;
          const truncatedOwnerName = truncateByBytes(
            ownerName,
            MAX_ROOM_NAME_BYTES - suffixBytes
          );
          const roomName = `${truncatedOwnerName}${suffix}`;
          await conference.createAndJoinRoom({
            roomId,
            roomType,
            options: { roomName },
          });
        } else {
          await conference.joinRoom({
            roomId,
            roomType,
            password,
          });
        }
      } catch (error) {
        handleErrorWithModal(error);
        navigate('/home', { replace: true });
      }
    };
    void enterRoom();
  }, [userId]);

  const currentRoomId = currentRoom?.roomId;
  const prevRoomIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prevRoomId = prevRoomIdRef.current;
    prevRoomIdRef.current = currentRoomId;
    if (prevRoomId || !currentRoomId) {
      return;
    }
    const room = currentRoomRef.current;
    if (
      room?.roomType === RoomType.Webinar &&
      room?.roomOwner?.userId !== loginUserInfoRef.current?.userId
    ) {
      return;
    }

    const openCamera = async () => {
      if (!localVideoQualityRef.current) {
        updateVideoQuality({ quality: VideoQuality.Quality720P });
      }
      if (getCameraPreference()) {
        try {
          await openLocalCamera();
        } catch (error) {
          handleErrorWithModal(error);
        }
      }
    };

    const openMicrophone = async () => {
      try {
        await muteMicrophone();
        await openLocalMicrophone();
      } catch (error) {
        handleErrorWithModal(error);
      }
      if (getMicrophonePreference()) {
        await unmuteMicrophone();
      }
    };

    void openCamera();
    void openMicrophone();
  }, [currentRoomId]);

  useEffect(() => {
    const handleBackHome = () => {
      navigate('/home', { replace: true });
    };
    conference.on(ConferenceRoomEvent.ROOM_DISMISS, handleBackHome);
    conference.on(ConferenceRoomEvent.ROOM_LEAVE, handleBackHome);
    conference.on(ConferenceRoomEvent.ROOM_ERROR, handleBackHome);
    conference.on(ConferenceRoomEvent.KICKED_OUT, handleBackHome);
    return () => {
      conference.off(ConferenceRoomEvent.ROOM_DISMISS, handleBackHome);
      conference.off(ConferenceRoomEvent.ROOM_LEAVE, handleBackHome);
      conference.off(ConferenceRoomEvent.ROOM_ERROR, handleBackHome);
      conference.off(ConferenceRoomEvent.KICKED_OUT, handleBackHome);
    };
  }, []);

  return <ConferenceMainView />;
}
