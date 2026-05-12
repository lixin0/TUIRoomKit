<template>
  <TUIDialog
    :visible="true"
    width="440px"
    appendTo="#roomPage"
    :title="t('AITools.SettingsTitle')"
    :confirmText="t('AITools.Save')"
    :cancelText="t('AITools.Cancel')"
    :customClasses="['ai-subtitle-settings-dialog']"
    @close="emit('close')"
    @cancel="emit('close')"
    @confirm="handleConfirm"
  >
    <div class="settings-body">
      <div class="settings-group">
        <div v-if="isOwner" class="settings-item">
          <span class="settings-label">{{ t('AITools.SourceLanguage') }}</span>
          <TUISelect v-model="draftSourceLanguage" :disabled="!isOwner">
            <TUIOption
              v-for="option in sourceLanguageOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </TUISelect>
        </div>
        <div v-if="isOwner" class="settings-item">
          <span class="settings-label">{{ t('AITools.TargetLanguage') }}</span>
          <TUISelect v-model="draftTargetLanguage">
            <TUIOption
              v-for="option in targetLanguageOptions"
              :key="option.value || 'none'"
              :value="option.value"
              :label="option.label"
            />
          </TUISelect>
        </div>
        <div class="settings-item switch-item">
          <span class="settings-label">{{ t('AITools.SubtitleModeSwitchLabel') }}</span>
          <TUISwitch v-model="isBilingualMode" />
        </div>
      </div>
    </div>
  </TUIDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  TUIDialog,
  TUIOption,
  TUISelect,
  TUISwitch,
  TUIToast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-vue3';
import { useASRToolsState } from '../../hooks/useASRToolsState';
import { createSourceLanguageOptions, createTargetLanguageOptions } from '../../utils/asrSettings';

const props = withDefaults(defineProps<{
  isOwner?: boolean;
}>(), {
  isOwner: false,
});

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { t } = useUIKit();
const {
  sourceLanguage,
  targetLanguage,
  subtitleDisplayMode,
  saveSettings,
} = useASRToolsState();

const sourceLanguageOptions = computed(() => createSourceLanguageOptions(t));
const targetLanguageOptions = computed(() => createTargetLanguageOptions(t));

const draftSourceLanguage = ref(sourceLanguage.value);
const draftTargetLanguage = ref(targetLanguage.value);
const isBilingualMode = ref(subtitleDisplayMode.value === 'bilingual');

watch(sourceLanguage, (value) => {
  draftSourceLanguage.value = value;
});

watch(targetLanguage, (value) => {
  draftTargetLanguage.value = value;
});

watch(subtitleDisplayMode, (value) => {
  isBilingualMode.value = value === 'bilingual';
});

async function handleConfirm() {
  try {
    await saveSettings({
      sourceLanguage: draftSourceLanguage.value,
      targetLanguage: draftTargetLanguage.value,
      subtitleDisplayMode: isBilingualMode.value ? 'bilingual' : 'translation',
    });
    emit('close');
  } catch (error) {
    console.error('[ASRTools] failed to save subtitle settings:', error);
    TUIToast.error({ message: t('AITools.SaveSettingsFailed') });
  }
}
</script>

<style scoped lang="scss">
.settings-body {
  padding: 2px;
  width: 100%;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 4px 0 8px;
}

.settings-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.settings-label {
  color: var(--text-color-secondary);
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
}

.switch-item {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 2px 0 0;
  border-radius: 12px;
}
</style>
