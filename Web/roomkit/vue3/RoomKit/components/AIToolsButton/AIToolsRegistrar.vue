<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useUIKit } from '@tencentcloud/uikit-base-component-vue3';
import { conference } from '../../adapter/conference';
import { BuiltinWidget } from '../../adapter/type';
import AIToolsButton from './index.vue';
import RealtimeMessageListPanel from './RealtimeMessageListPanel.vue';

const { t } = useUIKit();

const unregister = conference.registerWidget({
  id: BuiltinWidget.AIToolsWidget,
  zone: { pc: 'bottom-center' },
  order: 7,
  component: AIToolsButton,
  panel: {
    title: () => t('AITools.RealtimeMessageList'),
    component: RealtimeMessageListPanel,
  },
});

onUnmounted(() => unregister());
</script>

<template>
  <!-- Registrar: registration-only, rendering handled by CustomWidgetRenderer -->
</template>
