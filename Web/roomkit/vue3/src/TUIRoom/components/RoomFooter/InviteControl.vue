<template>
  <div
    v-if="inviteControlConfig.visible"
    class="invite-control-container"
    v-click-outside="handleClickOutSide"
  >
    <icon-button
      class="invite"
      :is-active="sidebarName === 'invite'"
      :title="t('Invite')"
      @click-icon="toggleInviteSidebar"
    >
      <IconInvite size="24" />
    </icon-button>
    <room-invite ref="inviteRef" v-if="!isMobile && isShowInviteTab" />
  </div>
</template>
<script setup lang="ts">
import { defineEmits, ref } from 'vue';
import { IconInvite } from '@tencentcloud/uikit-base-component-vue3';
import IconButton from '../common/base/IconButton.vue';
import { useBasicStore } from '../../stores/basic';
import { storeToRefs } from 'pinia';
import { useI18n } from '../../locales';
import { roomService } from '../../services';
import roomInvite from '../RoomInvite';
import { isMobile } from '../../utils/environment';
import vClickOutside from '../../directives/vClickOutside';

const isShowInviteTab = ref(false);
const inviteRef = ref();
const basicStore = useBasicStore();
const { sidebarName } = storeToRefs(basicStore);
const { t } = useI18n();
const emit = defineEmits(['show-overlay']);
const inviteControlConfig = roomService.getComponentConfig('InviteControl');
function toggleInviteSidebar() {
  isShowInviteTab.value = !isShowInviteTab.value;
  if (isMobile) {
    if (basicStore.sidebarName === 'invite') {
      basicStore.setSidebarName('');
      return;
    }
    basicStore.setSidebarName('invite');
    emit('show-overlay', {
      name: 'RoomInviteOverlay',
      visible: isShowInviteTab.value,
    });
  }
  roomService.trackingManager.sendMessage('experience-invite');
}

function handleClickOutSide() {
  if (isShowInviteTab.value) {
    isShowInviteTab.value = false;
  }
}
</script>

<style lang="scss" scoped>
.invite-control-container {
  position: relative;
}
</style>
