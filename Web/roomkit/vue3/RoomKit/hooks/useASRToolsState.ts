import { ref, watch } from 'vue';
import { TUIErrorCode } from '@tencentcloud/tuiroom-engine-js';
import { TUIToast, useUIKit } from '@tencentcloud/uikit-base-component-vue3';
import { useAITranscriberState, useRoomParticipantState, useRoomState, SubtitleDisplayMode, RealtimeTranscriberEvent } from 'tuikit-atomicx-vue3/room';
import {
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_SUBTITLE_DISPLAY_MODE,
  DEFAULT_TARGET_LANGUAGE,
} from '../utils/asrSettings';

const sourceLanguage = ref(DEFAULT_SOURCE_LANGUAGE);
const targetLanguage = ref(DEFAULT_TARGET_LANGUAGE);
const subtitleDisplayMode = ref<SubtitleDisplayMode>(DEFAULT_SUBTITLE_DISPLAY_MODE);
const hasStartedASR = ref(false);
const isStoppingASR = ref(false);

const {
  startRealtimeTranscriber,
  stopRealtimeTranscriber,
  updateRealTimeTranscriber,
  subscribeEvent,
} = useAITranscriberState();
const { t } = useUIKit();
const { currentRoom } = useRoomState();
const { localParticipant } = useRoomParticipantState();

const resolveSDKSourceLanguage = (value: string) => value || 'auto';
const canManageTranscriber = () => currentRoom.value?.roomOwner?.userId === localParticipant.value?.userId;
const resetASRToolsState = () => {
  sourceLanguage.value = DEFAULT_SOURCE_LANGUAGE;
  targetLanguage.value = DEFAULT_TARGET_LANGUAGE;
  subtitleDisplayMode.value = DEFAULT_SUBTITLE_DISPLAY_MODE;
  hasStartedASR.value = false;
  isStoppingASR.value = false;
};

const extractErrorCode = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const candidate = error as Record<string, unknown>;
  const rawCode = candidate.code ?? candidate.errorCode ?? candidate.errCode;

  if (typeof rawCode === 'number' && Number.isFinite(rawCode)) {
    return rawCode;
  }

  if (typeof rawCode === 'string') {
    const parsed = Number(rawCode);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (typeof candidate.message === 'string') {
    const match = candidate.message.match(/-?\d{3,6}/);
    if (match) {
      const parsed = Number(match[0]);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const getASRStartErrorMessage = (error: unknown) => {
  const errorCode = extractErrorCode(error);

  switch (errorCode) {
    case TUIErrorCode.ERR_REQUIRE_PAYMENT:
      return t('AITools.StartFailedPackageRequired');
    default:
      return t('AITools.StartFailed');
  }
};

subscribeEvent(RealtimeTranscriberEvent.onRealtimeTranscriberStarted, () => {
  hasStartedASR.value = true;
});

subscribeEvent(RealtimeTranscriberEvent.onRealtimeTranscriberStopped, () => {
  hasStartedASR.value = false;
});

watch(() => currentRoom.value?.roomId, (roomId, previousRoomId) => {
  if (roomId !== previousRoomId) {
    resetASRToolsState();
  }
}, { immediate: true });

const stopASR = async (options?: { suppressError?: boolean; resetState?: boolean }) => {
  if (!hasStartedASR.value || isStoppingASR.value) {
    if (options?.resetState) {
      hasStartedASR.value = false;
    }
    return;
  }

  try {
    isStoppingASR.value = true;
    await stopRealtimeTranscriber();
    hasStartedASR.value = false;
  } catch (error) {
    if (!options?.suppressError) {
      console.error('[useASRToolsState] failed to stop ASR:', error);
      throw error;
    }
  } finally {
    if (options?.resetState) {
      hasStartedASR.value = false;
    }
    isStoppingASR.value = false;
  }
};

watch(
  () => canManageTranscriber(),
  (canManage, previousCanManage) => {
    if (previousCanManage && !canManage && hasStartedASR.value) {
      stopASR({ suppressError: true, resetState: true });
    }
  },
);

const ensureASRStarted = async () => {
  if (!canManageTranscriber() || hasStartedASR.value) {
    return;
  }

  try {
    await startRealtimeTranscriber({
      sourceLanguage: resolveSDKSourceLanguage(sourceLanguage.value),
      translationLanguages: targetLanguage.value ? [targetLanguage.value] : [],
    });
    hasStartedASR.value = true;
  } catch (error) {
    console.error('[useASRToolsState] failed to start ASR:', error);
    TUIToast.error({ message: getASRStartErrorMessage(error) });
    throw error;
  }
};

const saveSettings = async (options: {
  sourceLanguage?: string;
  targetLanguage?: string;
  subtitleDisplayMode?: SubtitleDisplayMode;
}) => {
  const isOwner = canManageTranscriber();
  const nextSourceLanguage = isOwner ? (options.sourceLanguage ?? sourceLanguage.value) : sourceLanguage.value;
  const nextTargetLanguage = isOwner ? (options.targetLanguage ?? targetLanguage.value) : targetLanguage.value;
  const nextSubtitleDisplayMode = options.subtitleDisplayMode ?? subtitleDisplayMode.value;
  const transcriberConfigChanged = isOwner && (
    nextSourceLanguage !== sourceLanguage.value
    || nextTargetLanguage !== targetLanguage.value
  );

  sourceLanguage.value = nextSourceLanguage;
  targetLanguage.value = nextTargetLanguage;
  subtitleDisplayMode.value = nextSubtitleDisplayMode;

  if (transcriberConfigChanged && hasStartedASR.value) {
    await updateRealTimeTranscriber({
      sourceLanguage: resolveSDKSourceLanguage(sourceLanguage.value),
      translationLanguages: targetLanguage.value ? [targetLanguage.value] : [],
    });
  }
};

export function useASRToolsState() {
  return {
    sourceLanguage,
    targetLanguage,
    subtitleDisplayMode,
    hasStartedASR,
    stopASR,
    ensureASRStarted,
    saveSettings,
  };
}
