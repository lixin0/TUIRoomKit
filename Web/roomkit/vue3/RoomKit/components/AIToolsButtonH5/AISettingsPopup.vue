<template>
  <TUIPopup
    v-model:visible="isSettingsPopupVisible"
    placement="bottom"
    height="90%"
    @close="handleClose"
  >
    <div class="settings-popup-container">
      <div class="settings-header">
        <IconArrowStrokeBack class="header-back" @click="handleClose" />
        <span class="settings-title">{{ t('AITools.SettingsTitle') }}</span>
      </div>

      <div class="settings-content">
        <div class="section-title">
          {{ t('AITools.SettingsSectionTitle') }}
        </div>
        <div class="settings-card">
          <div
            v-if="isOwner"
            class="settings-row"
            @click="openSelector('source')"
          >
            <span class="settings-label">{{ t('AITools.SourceLanguage') }}</span>
            <div class="settings-value">
              <span>{{ selectedSourceLanguageLabel }}</span>
              <IconRightArrow size="14" />
            </div>
          </div>

          <div
            v-if="isOwner"
            class="settings-row"
            @click="openSelector('target')"
          >
            <span class="settings-label">{{ t('AITools.TargetLanguage') }}</span>
            <div class="settings-value">
              <span>{{ selectedTargetLanguageLabel }}</span>
              <IconRightArrow size="14" />
            </div>
          </div>

          <div class="settings-row">
            <span class="settings-label">{{ t('AITools.SubtitleModeSwitchLabel') }}</span>
            <TUISwitch
              :model-value="subtitleDisplayMode === 'bilingual'"
              @change="handleSubtitleModeChange($event as boolean)"
            />
          </div>
        </div>
      </div>
    </div>
  </TUIPopup>

  <TUIPopup
    v-model:visible="isSelectorPopupVisible"
    placement="bottom"
    height="60%"
    @close="closeSelector"
  >
    <div class="selector-popup-container">
      <div class="selector-title">
        {{ selectorTitle }}
      </div>
      <div
        v-for="option in activeOptions"
        :key="option.value || 'none'"
        class="selector-item"
        :class="{ selected: option.value === activeValue }"
        @click="handleOptionSelect(option.value)"
      >
        {{ option.label }}
      </div>
    </div>
  </TUIPopup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  IconArrowStrokeBack,
  IconRightArrow,
  TUIPopup,
  TUISwitch,
  TUIToast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-vue3';
import { useASRToolsState } from '../../hooks/useASRToolsState';
import { createSourceLanguageOptions, createTargetLanguageOptions } from '../../utils/asrSettings';

const props = defineProps<{
  isOwner: boolean;
}>();

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

const isSettingsPopupVisible = ref(true);
const isSelectorPopupVisible = ref(false);
const selectorType = ref<'source' | 'target'>('source');

const sourceLanguageOptions = computed(() => createSourceLanguageOptions(t));
const targetLanguageOptions = computed(() => createTargetLanguageOptions(t));

const activeOptions = computed(() => (
  selectorType.value === 'source'
    ? sourceLanguageOptions.value
    : targetLanguageOptions.value
));

const activeValue = computed(() => (
  selectorType.value === 'source'
    ? sourceLanguage.value
    : targetLanguage.value
));

const selectorTitle = computed(() => (
  selectorType.value === 'source'
    ? t('AITools.SelectSourceLanguage')
    : t('AITools.SelectTargetLanguage')
));

const selectedSourceLanguageLabel = computed(
  () => sourceLanguageOptions.value.find(option => option.value === sourceLanguage.value)?.label || '',
);
const selectedTargetLanguageLabel = computed(
  () => targetLanguageOptions.value.find(option => option.value === targetLanguage.value)?.label || '',
);

function handleClose() {
  isSettingsPopupVisible.value = false;
  emit('close');
}

function openSelector(type: 'source' | 'target') {
  if (!props.isOwner) {
    return;
  }

  selectorType.value = type;
  isSelectorPopupVisible.value = true;
}

function closeSelector() {
  isSelectorPopupVisible.value = false;
}

async function handleOptionSelect(value: string) {
  try {
    if (selectorType.value === 'source') {
      await saveSettings({ sourceLanguage: value });
    } else {
      await saveSettings({ targetLanguage: value });
    }
    closeSelector();
  } catch (error) {
    console.error('[ASRTools] failed to update subtitle settings:', error);
    TUIToast.error({ message: t('AITools.SaveSettingsFailed') });
  }
}

async function handleSubtitleModeChange(value: boolean) {
  try {
    await saveSettings({
      subtitleDisplayMode: value ? 'bilingual' : 'translation',
    });
  } catch (error) {
    console.error('[ASRTools] failed to update subtitle mode:', error);
    TUIToast.error({ message: t('AITools.SaveSettingsFailed') });
  }
}
</script>

<style scoped lang="scss">
.settings-popup-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-color-secondary);
}

.settings-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border-bottom: 1px solid var(--stroke-color-primary);
}

.header-back {
  position: absolute;
  left: 16px;
  color: var(--text-color-primary);
}

.settings-title {
  color: var(--text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.settings-content {
  flex: 1;
  padding: 16px;
}

.section-title {
  margin-bottom: 12px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.settings-card {
  overflow: hidden;
  border-radius: 16px;
  background: var(--bg-color-entrycard);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 16px;
  color: var(--text-color-primary);

  &:not(:last-child) {
    border-bottom: 1px solid var(--stroke-color-primary);
  }
}

.settings-label {
  font-size: 16px;
}

.settings-value {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-color-secondary);
  font-size: 16px;
}

.selector-popup-container {
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  background: var(--bg-color-secondary);
  padding-bottom: env(safe-area-inset-bottom);
}

.selector-title {
  padding: 14px 16px;
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.selector-item {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-top: 1px solid var(--stroke-color-primary);
  color: var(--text-color-primary);
  font-size: 18px;

  &.selected {
    color: #2b6cf6;
  }
}
</style>
