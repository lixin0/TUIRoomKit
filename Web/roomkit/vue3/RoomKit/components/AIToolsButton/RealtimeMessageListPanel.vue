<template>
  <RealtimeMessageList
    :target-language="targetLanguage"
    :display-mode="subtitleDisplayMode"
  />
</template>

<script setup lang="ts">
import { RealtimeMessageList } from 'tuikit-atomicx-vue3/room';
import { useASRToolsState } from '../../hooks/useASRToolsState';

const {
  targetLanguage,
  subtitleDisplayMode,
} = useASRToolsState();
</script>
