<template>
  <icon-button
    :title="t('ScreenShare.Title')"
    :disabled="isScreenShareDisabled"
    @click-icon="handleScreenShare"
  >
    <IconStopScreenShare v-if="screenStatus === DeviceStatus.On" size="24" />
    <IconScreenShare
      v-if="screenStatus === DeviceStatus.Off"
      size="24"
    />
    <IconUnSupport
      v-if="screenLastError !== DeviceError.NoError"
      class="un-support-icon"
      size="14"
    />
  </icon-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IconScreenShare, IconStopScreenShare, TUIMessageBox, TUIToast, useUIKit, IconUnSupport } from '@tencentcloud/uikit-base-component-vue3';
import { useDeviceState, DeviceStatus, useRoomState, useRoomParticipantState, RoomParticipantRole, DeviceError, TUIErrorCode, RoomType } from 'tuikit-atomicx-vue3/room';
import { conference } from '../../adapter/conference';
import { InterceptorAction } from '../../adapter/type';
import IconButton from '../base/IconButton.vue';

const { currentRoom } = useRoomState();
const { localParticipant, participantWithScreen, participantList } = useRoomParticipantState();
const { screenStatus, screenLastError, startScreenShare, stopScreenShare } = useDeviceState();
const { t } = useUIKit();

const isLocalScreenShareUser = computed(() => participantWithScreen.value && participantWithScreen.value.userId === localParticipant.value?.userId);
const isScreenShareDisabled = computed(() => currentRoom.value?.isAllScreenShareDisabled && localParticipant.value?.role === RoomParticipantRole.GeneralUser && !isLocalScreenShareUser.value);

function isRoleEqualOrHigher(participantRole: RoomParticipantRole): boolean {
  const localRole = localParticipant.value?.role ?? RoomParticipantRole.GeneralUser;
  if (localRole === RoomParticipantRole.GeneralUser) {
    return true;
  }
  if (localRole === RoomParticipantRole.Admin) {
    return participantRole === RoomParticipantRole.Owner || participantRole === RoomParticipantRole.Admin;
  }
  return participantRole === RoomParticipantRole.Owner;
}

const isHigherRoleParticipantPublishingInWebinar = computed(() => {
  const isWebinar = currentRoom.value?.roomType === RoomType.Webinar;
  const otherParticipantPublishedVideo = participantList.value.some(
    participant => participant.userId !== localParticipant.value?.userId
      && participant.cameraStatus === DeviceStatus.On
      && isRoleEqualOrHigher(participant.role),
  );
  return isWebinar && otherParticipantPublishedVideo;
});

const isLowerRoleParticipantPublishingInWebinar = computed(() => {
  const isWebinar = currentRoom.value?.roomType === RoomType.Webinar;
  const lowerRoleParticipantPublishedVideo = participantList.value.some(
    participant => participant.userId !== localParticipant.value?.userId
      && participant.cameraStatus === DeviceStatus.On
      && !isRoleEqualOrHigher(participant.role),
  );
  return isWebinar && lowerRoleParticipantPublishedVideo;
});

async function handleStartScreenShare() {
  try {
    await startScreenShare({ screenAudio: true });
  } catch (error: unknown) {
    const err = error as { code?: number; name?: string; message?: string };
    let message = t('ScreenShare.UnknownErrorOccurredWhileSharing');
    switch (err.name) {
      case 'NotReadableError':
        message = t('ScreenShare.SystemProhibitsAccessScreenContent');
        break;
      case 'NotAllowedError':
        if (err.message?.includes('Permission denied by system')) {
          message = t('ScreenShare.SystemProhibitsAccessScreenContent');
        } else {
          message = t('ScreenShare.UserCanceledScreenSharing');
        }
        break;
      default:
        break;
    }
    if (err.code === TUIErrorCode.ERR_OPEN_SCREEN_SHARE_NEED_PERMISSION_FROM_ADMIN) {
      message = t('ScreenShare.NotAllowedToShareScreen');
    }
    const ERROR_SPEAKER_LIMIT_EXCEEDED = 100253;
    if (err?.code === ERROR_SPEAKER_LIMIT_EXCEEDED) {
      message = t('ScreenShare.HigherRoleParticipantPublishingInWebinar');
    }
    if (err.code === TUIErrorCode.ERR_FREQ_LIMIT) {
      message = t('RoomCommon.FrequencyLimit');
    }
    TUIToast.warning({
      message,
    });
  }
}

async function doStartScreenShare() {
  await conference.executeInterceptor(InterceptorAction.StartScreenShare, () => {
    TUIMessageBox.confirm({
      title: t('ScreenShare.StartSharing'),
      content: t('ScreenShare.StartSharingConfirm'),
      callback: async (action) => {
        if (action === 'confirm') {
          await handleStartScreenShare();
        }
      },
    });
  });
}

async function handleScreenShare() {
  if (screenStatus.value === DeviceStatus.On) {
    conference.executeInterceptor(InterceptorAction.StopScreenShare, () => {
      TUIMessageBox.confirm({
        title: t('ScreenShare.EndSharing'),
        content: t('ScreenShare.StopSharingConfirm'),
        callback: async (action) => {
          if (action === 'confirm') {
            await stopScreenShare();
          }
        },
      });
    });
  } else {
    if (isScreenShareDisabled.value) {
      TUIToast.warning({
        message: t('ScreenShare.NotAllowedToShareScreen'),
      });
      return;
    }
    if (participantWithScreen.value) {
      TUIToast.warning({
        message: t('ScreenShare.AnotherIsSharingTheScreen'),
      });
      return;
    }
    if (screenLastError.value === DeviceError.NotSupportCapture) {
      TUIToast.warning({
        message: t('ScreenShare.BrowserDoesNotSupportScreenSharing'),
      });
      return;
    }
    if (isHigherRoleParticipantPublishingInWebinar.value) {
      TUIToast.warning({
        message: t('ScreenShare.HigherRoleParticipantPublishingInWebinar'),
      });
      return;
    }
    if (isLowerRoleParticipantPublishingInWebinar.value) {
      TUIMessageBox.confirm({
        title: t('ScreenShare.SomeonePresentingTitle'),
        content: t('ScreenShare.SomeonePresentingConfirm'),
        callback: async (action) => {
          if (action === 'confirm') {
            await doStartScreenShare();
          }
        },
      });
      return;
    }
    await doStartScreenShare();
  }
}
</script>

<style scoped lang="scss">
.un-support-icon {
  position: absolute;
  top: 13px;
  left: 26px;
}
</style>
