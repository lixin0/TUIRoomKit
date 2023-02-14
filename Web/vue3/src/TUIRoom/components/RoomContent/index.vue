<template>
  <div id="contentContainer" class="content-container">
    <div v-if="isMaster" id="streamOuterContainer" class="stream-container" :style="contentContainerStyle">
      <stream-container :show-room-tool="showRoomTool" :scale="boardScale"></stream-container>
      <fabric-board></fabric-board>
    </div>
    <div v-else class="primary-container">
      <stream-container :show-room-tool="showRoomTool" :scale="boardScale"></stream-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, onUnmounted } from 'vue';
import StreamContainer from './StreamContainer.vue';
import FabricBoard from '../FabricBoard/index.vue';
import { storeToRefs } from 'pinia';
import { useBasicStore } from '../../stores/basic';
import { useRoomStore } from '../../stores/room';

defineProps<{
  showRoomTool: boolean,
}>();

const contentContainerStyle: Ref<Record<string, any>> = ref({ transform: 'scale(1)' });
const basicStore = useBasicStore();
const roomStore = useRoomStore();
const { isMaster } = storeToRefs(roomStore);
const { boardScale } = storeToRefs(basicStore);

const basicWidth = 1920;
const basicHeight = 1080;

function handleContentContainerStyle() {
  const containerWidth = document.getElementById('contentContainer')!.offsetWidth;
  const containerHeight = document.getElementById('contentContainer')!.offsetHeight;
  const scaleWidth = containerWidth / basicWidth;
  const scaleHeight = containerHeight / basicHeight;
  const scaleValue = scaleWidth > scaleHeight ? scaleHeight : scaleWidth;

  const streamWidth = basicWidth * scaleValue;
  const streamHeight = basicHeight * scaleValue;
  contentContainerStyle.value.transform = `translate(${((containerWidth - streamWidth) / 2).toFixed()}px, ${((containerHeight - streamHeight) / 2).toFixed()}px) scale(${scaleValue})`;
  basicStore.setBoardScale(scaleValue);
}

onMounted(() => {
  handleContentContainerStyle();
  ['resize', 'pageshow'].forEach((event) => {
    window.addEventListener(event, handleContentContainerStyle);
  });
});

onUnmounted(() => {
  ['resize', 'pageshow'].forEach((event) => {
    window.removeEventListener(event, handleContentContainerStyle);
  });
});

</script>

<style lang="scss" scoped>
.content-container {
  background-color: var(--stream-container-flatten-bg-color);
}
.stream-container {
  width: 1920px;
  height: 1080px;
  display: flex;
  background-color: yellow;
  transform-origin: left top;
  align-items: center;
  justify-content: center;
  .left-container {
    height: 100%;
    display: flex;
    align-items: center;
    > :not(:first-child) {
      margin-left: 1rem;
    }
  }
}
.primary-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
