import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useRoomState } from 'tuikit-atomicx-vue3/room';

interface UseSubtitlesStateReturn {
  isSubtitlesVisible: Ref<boolean>;
  resetSubtitlesState: () => void;
}

/**
 * Module-level shared state for AI subtitles visibility.
 *
 * The state is kept outside the component so that it survives
 * component re-creation caused by the overflow recalculation
 * in CustomWidgetRenderer (visible ↔ overflow transitions
 * destroy and re-mount the AIToolsButton instance).
 */
const isSubtitlesVisible = ref(false);

const resetSubtitlesState = () => {
  isSubtitlesVisible.value = false;
};

const { currentRoom } = useRoomState();
watch(
  () => currentRoom.value?.roomId,
  (roomId, oldRoomId) => {
    // Reset subtitle visibility whenever room context changes.
    if (roomId !== oldRoomId) {
      resetSubtitlesState();
    }
  },
);

export function useSubtitlesState(): UseSubtitlesStateReturn {
  return {
    isSubtitlesVisible,
    resetSubtitlesState,
  };
}
