<script setup lang="ts">
import { onUnmounted } from 'vue';
import { conference } from '../../adapter/conference';
import { BuiltinWidget } from '../../adapter/type';
import CallButton from './index.vue';

const unregister = conference.registerWidget({
  id: BuiltinWidget.InviteWidget,
  zone: { pc: 'bottom-center' },
  order: 2,
  component: CallButton,
});

onUnmounted(() => unregister());
</script>

<template>
  <!-- Registrar: registration-only, rendering handled by CustomWidgetRenderer -->
</template>
