<template>
  <div class="invite-control-container">
    <icon-button
      :is-active="showLiveDialog"
      :title="t('Live')"
      :icon-name="iconName"
      @click-icon="handleShowLiveDialog"
    />
  </div>
  <Dialog
    :model-value="showLiveDialog"
    :title="t('Live')"
    :modal="false"
    :before-close="handleDialogClose"
  >
    <div>Live broadcast parameter setting:</div>
    <div id="appId" class="push-cdn-params">
      <span class="title">appId: </span>
      <el-input v-model="appId" placeholder="Please input appId" />
    </div>
    <div id="bizId" class="push-cdn-params">
      <span class="title">bizId: </span>
      <el-input v-model="bizId" placeholder="Please input bizId" />
    </div>
    <div id="pushCDNURL" class="push-cdn-params">
      <span class="title">push CDN URL: </span>
      <el-input v-model="pushCDNURL" placeholder="Please input push CDN URL" />
    </div>
    <template #footer>
      <el-button :disabled="!appId || !bizId || !pushCDNURL" type="primary" @click="handleStartLive">
        Start Live
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Ref, ref, computed, onMounted, watch, nextTick } from 'vue';
import IconButton from '../common/IconButton.vue';
import { ICON_NAME } from '../../constants/icon';
import { useI18n } from '../../locales';
import Dialog from '../../elementComp/Dialog.vue';
import useGetRoomEngine from '../../hooks/useRoomEngine';
import { TRTCVideoStreamType, TUIVideoStreamType } from '@tencentcloud/tuiroom-engine-js';
import { getUrlParam } from '../../utils/utils';
import TRTCCloud, { TRTCTranscodingConfig, TRTCTranscodingConfigMode, TRTCMixUser, Rect, TRTCRoleType, TRTCAppScene, TRTCVideoResolution } from 'trtc-cloud-js-sdk';
import { useBasicStore } from '../../stores/basic';
import { useRoomStore } from '../../stores/room';
import { SDKAPPID, generateUserSig } from '../../../config/basic-info-config';
import { ElMessage } from '../../elementComp';
import { MESSAGE_DURATION } from '../../constants/message';
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const roomEngine = useGetRoomEngine();
const basicStore = useBasicStore();
const roomStore = useRoomStore();
const { streamNumber } = storeToRefs(roomStore);

watch(streamNumber, async () => {
  if (isOnLive.value) {
    await nextTick();
    await handleStartMixTranscode();
    ElMessage({
      type: 'success',
      message: 'update live success!',
      duration: MESSAGE_DURATION.NORMAL,
    });
  }
});

// 展示 Live Dialog
const showLiveDialog = ref(false);
// 是否在直播中
const isOnLive = ref(false);

const appId: Ref<number | undefined> = ref(undefined);
const bizId: Ref<number | undefined> = ref(undefined);
const pushCDNURL: Ref<string> = ref('');

const iconName = computed(() => {
  if (isOnLive.value) {
    return ICON_NAME.Living;
  }
  if (showLiveDialog.value) {
    return ICON_NAME.LiveActive;
  }
  return ICON_NAME.Live;
});

function handleShowLiveDialog() {
  showLiveDialog.value = !showLiveDialog.value;
}

function handleDialogClose() {
  showLiveDialog.value = false;
}

// start Live
async function handleStartLive() {
  const trtcCloud = roomEngine.instance?.getTRTCCloud();
  // push stream to tencent cloud cdn
  await trtcCloud.startPublishing('', TRTCVideoStreamType.TRTCVideoStreamTypeBig);
  // push to given cdn url
  await trtcCloud.startPublishCDNStream({
    appId: Number(appId.value),
    bizId: Number(bizId.value),
    url: pushCDNURL.value,
  });

  // push white borad stream to tenct cloud cdn
  await handlePushWhiteBoardStream();

  // do mix stream in tencent cloud
  await handleStartMixTranscode();

  isOnLive.value = true;
  ElMessage({
    type: 'success',
    message: 'start live success!',
    duration: MESSAGE_DURATION.NORMAL,
  });
}

async function handlePushWhiteBoardStream() {
  const canvas = document.querySelector('canvas#fabricBoard') as HTMLCanvasElement;
  const fps = 15;
  const stream = canvas?.captureStream(fps);
  const videoTrack = stream?.getVideoTracks()[0];
  const trtcCloud = new TRTCCloud();
  trtcCloud.enableCustomVideoCapture(TRTCVideoStreamType.TRTCVideoStreamTypeBig, true);
  await trtcCloud.enterRoom({
    sdkAppId: SDKAPPID,
    userId: 'whiteBoard',
    userSig: generateUserSig('whiteBoard'),
    roomId: 0,
    strRoomId: basicStore.roomId,
    role: TRTCRoleType.TRTCRoleAnchor,
  }, TRTCAppScene.TRTCAppSceneVideoCall);
  await trtcCloud.setVideoEncoderParam({
    videoResolution: TRTCVideoResolution.TRTCVideoResolution_1920_1080,
    videoFps: 15,
    videoBitrate: 900,
  });
  await trtcCloud.sendCustomVideoData(TRTCVideoStreamType.TRTCVideoStreamTypeBig, videoTrack);
}

async function handleStartMixTranscode() {
  const streamContainer = document.querySelector('#streamOuterContainer');
  const streamRegionList = document.querySelectorAll('.stream-list > .user-stream-container');
  console.log('lixin-debug streamItemList', streamRegionList);

  const transcodingConfig = new TRTCTranscodingConfig();
  transcodingConfig.appId = appId.value;
  transcodingConfig.bizId = bizId.value;
  transcodingConfig.mode = TRTCTranscodingConfigMode.TRTCTranscodingConfigMode_Manual;
  transcodingConfig.videoWidth = (streamContainer as HTMLDivElement).clientWidth;
  transcodingConfig.videoHeight = (streamContainer as HTMLDivElement).clientHeight;
  transcodingConfig.backgroundColor = 0xEEEEEE;
  // todo: 确认web端填0是否可行
  transcodingConfig.videoBitrate = 2000;
  // todo: 确认真实的默认值，是创建出来的 48000，还是 64
  transcodingConfig.audioBitrate = 64;

  const mixUsers: TRTCMixUser[] = [];

  streamRegionList.forEach((item) => {
    const mixUser = new TRTCMixUser();
    const rect = new Rect();
    const streamRegionId = [...item.children].filter(child => child.className === 'stream-region')[0].id;
    const streamInfoList = streamRegionId.split('_');
    const userId = `${streamInfoList[0]}_${streamInfoList[1]}`;
    const streamType = Number(streamInfoList[2]) === TUIVideoStreamType.kScreenStream
      ? TRTCVideoStreamType.TRTCVideoStreamTypeSub : TRTCVideoStreamType.TRTCVideoStreamTypeBig;

    mixUser.roomId = basicStore.roomId;
    mixUser.userId = userId;
    mixUser.streamType = streamType;
    mixUser.zOrder = 2;
    rect.left = item.offsetLeft;
    rect.top = item.offsetTop
    rect.right = item.offsetLeft + item.clientWidth;
    rect.bottom = item.offsetTop + item.clientHeight;
    mixUser.rect = rect;
    mixUsers.push(mixUser);
  });

  const mixUser = new TRTCMixUser();
  const canvas = (document.querySelector('canvas#fabricBoard') as HTMLCanvasElement);
  const rect = new Rect();
  mixUser.roomId = basicStore.roomId;
  mixUser.userId = 'whiteBoard';
  mixUser.streamType = TRTCVideoStreamType.TRTCVideoStreamTypeBig;
  mixUser.zOrder = 1;
  rect.left = canvas.offsetLeft;
  rect.top = canvas.offsetTop;
  rect.right = canvas.offsetLeft + (streamContainer as HTMLDivElement).clientWidth;
  rect.bottom = canvas.offsetTop +  (streamContainer as HTMLDivElement).clientHeight;
  mixUser.rect = rect;
  mixUsers.push(mixUser);

  transcodingConfig.mixUsersArray = mixUsers;

  const trtcCloud = roomEngine.instance?.getTRTCCloud();
  await trtcCloud.setMixTranscodingConfig(transcodingConfig);
}

onMounted(() => {
  if (getUrlParam('appId')) {
    appId.value = Number(getUrlParam('appId'));
  }
  if (getUrlParam('bizId')) {
    bizId.value = Number(getUrlParam('bizId'));
  }
  if (getUrlParam('pushUrl')) {
    pushCDNURL.value = getUrlParam('pushUrl') as string;
  }
});

</script>

<style lang="scss" scoped>

.push-cdn-params {
  display: flex;
  align-items: center;
  margin-top: 18px;
  .title {
    width: 160px;
  }
}
</style>
