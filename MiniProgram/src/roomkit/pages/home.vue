<template>
  <div class="home-container">
    <PreConferenceView
      :user-info="userInfo"
      :room-id="givenRoomId"
      @on-create-room="handleCreateRoom"
      @on-enter-room="handleEnterRoom"
      @on-logout="handleLogOut"
      @on-update-user-name="handleUpdateUserName"
    />
  </div>
</template>

<script setup lang="ts">
import PreConferenceView from '../TUIRoom/preConference.vue';
import {
  conference,
  RoomEvent,
  LanguageOption,
  ThemeOption,
} from '../TUIRoom/index.ts';
import { getBasicInfo } from '../config/basic-info-config';
import router from '@/router';
import { useRoute } from '@/router/wxRouter';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import i18n from '../locales/index';
import { getLanguage, getTheme } from '../utils/utils';

declare const uni: any;
const route = useRoute();
const roomId = String(route.query?.roomId as string) ? route.query?.roomId : '';
const givenRoomId: Ref<string> = ref(roomId as string);

const userInfo = reactive({
  userId: '',
  userName: '',
  avatarUrl: '',
});

function setTUIRoomData(action: string, roomOption: Record<string, any>) {
  uni.setStorageSync(
    'tuiRoom-roomInfo',
    JSON.stringify({
      action,
      ...roomOption,
    })
  );
}

async function checkRoomExistWhenCreateRoom(roomId: string) {
  let isRoomExist = false;
  const tim = conference.getRoomEngine()?.getTIM();
  try {
    await tim?.searchGroupByID(roomId);
    isRoomExist = true;
  } catch (error: any) {
    // 房间不存在
  }
  return isRoomExist;
}

/**
 * Generate room number when creating a room
 *
 * 创建房间时生成房间号
 **/
async function generateRoomId(): Promise<string> {
  const roomId = String(Math.ceil(Math.random() * 1000000));
  const isRoomExist = await checkRoomExistWhenCreateRoom(String(roomId));
  if (isRoomExist) {
    return await generateRoomId();
  }
  return roomId;
}

/**
 * Processing Click [Create Room]
 *
 * 处理点击【创建房间】
 **/
async function handleCreateRoom(roomOption: Record<string, any>) {
  setTUIRoomData('createRoom', roomOption);
  const roomId = await generateRoomId();
  router.replace({
    path: 'room',
    query: {
      roomId,
    },
  });
}

/**
 * Processing Click [Enter Room]
 *
 * 处理点击【进入房间】
 **/
async function handleEnterRoom(roomOption: Record<string, any>) {
  setTUIRoomData('enterRoom', roomOption);
  router.replace({
    path: 'room',
    query: {
      roomId: roomOption.roomId,
    },
  });
}

function handleUpdateUserName(userName: string) {
  try {
    const currentUserInfo = JSON.parse(
      uni.getStorageSync('tuiRoom-userInfo') as string
    );
    currentUserInfo.userName = userName;
    uni.setStorageSync('tuiRoom-userInfo', JSON.stringify(currentUserInfo));
  } catch (error) {
    console.log('sessionStorage error', error);
  }
}

/**
 * Processing users click [Logout Login] in the upper left corner of the page
 *
 * 处理用户点击页面左上角【退出登录】
 **/
async function handleLogOut() {
  /**
   * The accessor handles the logout method
   *
   * 接入方处理 logout 方法
   **/
}

async function handleInit() {
  uni.removeStorageSync('tuiRoom-roomInfo');
  uni.removeStorageSync('tuiRoom-userInfo');
  conference.setLanguage(getLanguage() as LanguageOption);
  conference.setTheme(getTheme() as ThemeOption);

  const currentUserInfo = getBasicInfo();
  if (!currentUserInfo) {
    return;
  }
  uni.setStorageSync('tuiRoom-userInfo', JSON.stringify(currentUserInfo));
  userInfo.userId = currentUserInfo.userId;
  userInfo.userName = currentUserInfo.userName;
  userInfo.avatarUrl = currentUserInfo.avatarUrl;
  const { userId, sdkAppId, userSig, userName, avatarUrl } = currentUserInfo;
  await conference.login({ sdkAppId, userId, userSig });
  await conference.setSelfInfo({ userName, avatarUrl });
}

onMounted(() => {
  handleInit();
});

const changeLanguage = (language: LanguageOption) => {
  i18n.global.locale.value = language;
  uni.setStorageSync('tuiRoom-language', language);
};
const changeTheme = (theme: ThemeOption) => {
  uni.setStorageSync('tuiRoom-currentTheme', theme);
};

onMounted(() => {
  conference.on(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.on(RoomEvent.THEME_CHANGED, changeTheme);
});

onUnmounted(() => {
  conference.off(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.off(RoomEvent.THEME_CHANGED, changeTheme);
});
</script>
<style lang="scss" scoped>
.home-container {
  width: 100%;
  height: 100%;
}
</style>
