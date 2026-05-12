<template>
  <div class="home-view">
    <div
      v-if="showTestPanel"
      class="room-test-panel"
    >
      <div class="room-test-panel__title">Test Room</div>
      <input
        v-model="manualRoomId"
        class="room-test-panel__input"
        type="text"
        inputmode="numeric"
        maxlength="10"
        placeholder="指定创建房间号"
        @input="handleManualRoomIdInput"
      >
      <div class="room-test-panel__tip">填写后点击预会页里的“创建房间”，将优先使用这里的房间号。</div>
    </div>
    <PreConferenceView
      @logout="handleLogout"
      @create-room="handleCreateRoom"
      @join-room="handleJoinRoom"
      @camera-preference-change="handleCameraPreferenceChange"
      @microphone-preference-change="handleMicrophonePreferenceChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PreConferenceView } from '@tencentcloud/roomkit-web-vue3';
import { useRoute, useRouter } from 'vue-router';
import { useMediaPreference } from '../hooks/useMediaPreference';
import type { TUIRoomType } from 'tuikit-atomicx-vue3/room';

const route = useRoute();
const router = useRouter();
const manualRoomId = ref('');

const { setMicrophonePreference, setCameraPreference } = useMediaPreference();

const normalizeRoomId = (value: string) => value.replace(/\D/g, '').slice(0, 10);
const showTestPanel = route.query.test === 'true';

const handleManualRoomIdInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  manualRoomId.value = normalizeRoomId(target.value);
};

const handleCameraPreferenceChange = (isOpen: boolean) => {
  setCameraPreference(isOpen);
};

const handleMicrophonePreferenceChange = (isOpen: boolean) => {
  setMicrophonePreference(isOpen);
};

const handleLogout = () => {
  router.push('/login');
};

const handleCreateRoom = async (roomId: string, roomType: TUIRoomType) => {
  const targetRoomId = manualRoomId.value || roomId;
  sessionStorage.setItem(`room-${targetRoomId}-isCreate`, 'true');
  router.push({
    path: '/room',
    query: { roomId: targetRoomId, roomType },
  });
};

const handleJoinRoom = async (roomId: string, roomType: TUIRoomType) => {
  sessionStorage.setItem(`room-${roomId}-isCreate`, 'false');
  router.push({
    path: '/room',
    query: { roomId, roomType },
  });
};
</script>

<style lang="scss" scoped>
.home-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.room-test-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  width: 220px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.86)),
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0));
  box-shadow:
    0 18px 40px rgba(148, 163, 184, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
}

.room-test-panel__title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  color: #111827;
}

.room-test-panel__input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #c9d5e6;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.96);
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.room-test-panel__input:focus {
  border-color: #90a8cb;
  box-shadow: 0 0 0 4px rgba(191, 219, 254, 0.35);
  background: #ffffff;
}

.room-test-panel__input::placeholder {
  color: #9ca3af;
}

.room-test-panel__tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 18px;
  color: #475569;
}
</style>
