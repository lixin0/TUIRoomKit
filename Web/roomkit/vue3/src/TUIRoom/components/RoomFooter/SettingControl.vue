<template>
  <div class="setting-control-container">
    <icon-button
      :is-active="showSettingDialog"
      :title="t('Settings')"
      @click-icon="handleShowSettingDialog"
    >
      <IconSetting size="24" />
    </icon-button>
  </div>
</template>

<script setup lang="ts">
import { IconSetting } from '@tencentcloud/uikit-base-component-vue3';
import IconButton from '../common/base/IconButton.vue';
import { useBasicStore } from '../../stores/basic';
import { storeToRefs } from 'pinia';
import { useI18n } from '../../locales';

const { t } = useI18n();

const basicStore = useBasicStore();
const { showSettingDialog } = storeToRefs(basicStore);

function handleShowSettingDialog() {
  basicStore.setShowSettingDialog(!basicStore.showSettingDialog);
}
</script>

<style lang="scss" scoped></style>
