import { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { PreConferenceView } from '@tencentcloud/roomkit-web-react';
import type { RoomType } from 'tuikit-atomicx-react/room';
import { useMediaPreference } from '@/hooks/useMediaPreference';
import './home.scss';

const normalizeRoomId = (value: string) =>
  value.replace(/\D/g, '').slice(0, 10);

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [manualRoomId, setManualRoomId] = useState('');

  const { setCameraPreference, setMicrophonePreference } = useMediaPreference();

  const showTestPanel = searchParams.get('test') === 'true';

  const handleManualRoomIdInput = (event: ChangeEvent<HTMLInputElement>) => {
    setManualRoomId(normalizeRoomId(event.target.value));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleCreateRoom = (roomId: string, roomType: RoomType) => {
    const targetRoomId = manualRoomId || roomId;
    sessionStorage.setItem(`room-${targetRoomId}-isCreate`, 'true');
    navigate({
      pathname: '/room',
      search: createSearchParams({
        roomId: targetRoomId,
        roomType: String(roomType),
      }).toString(),
    });
  };

  const handleJoinRoom = (roomId: string, roomType: RoomType) => {
    sessionStorage.setItem(`room-${roomId}-isCreate`, 'false');
    navigate({
      pathname: '/room',
      search: createSearchParams({
        roomId,
        roomType: String(roomType),
      }).toString(),
    });
  };

  const handleCameraPreferenceChange = (isOpen: boolean) => {
    setCameraPreference(isOpen);
  };

  const handleMicrophonePreferenceChange = (isOpen: boolean) => {
    setMicrophonePreference(isOpen);
  };

  return (
    <div className="home-view">
      {showTestPanel && (
        <div className="room-test-panel">
          <div className="room-test-panel-title">Test Room</div>
          <input
            className="room-test-panel-input"
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="指定创建房间号"
            value={manualRoomId}
            onChange={handleManualRoomIdInput}
          />
          <div className="room-test-panel-tip">
            填写后点击预会页里的“创建房间”，将优先使用这里的房间号。
          </div>
        </div>
      )}
      <PreConferenceView
        onLogout={handleLogout}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onCameraPreferenceChange={handleCameraPreferenceChange}
        onMicrophonePreferenceChange={handleMicrophonePreferenceChange}
      />
    </div>
  );
}
