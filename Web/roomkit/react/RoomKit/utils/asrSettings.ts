import type { ASRSettingsOption, SubtitleDisplayMode } from 'tuikit-atomicx-vue3/room';

export const DEFAULT_SOURCE_LANGUAGE = 'zh';
export const DEFAULT_TARGET_LANGUAGE = 'en';
export const DEFAULT_SUBTITLE_DISPLAY_MODE: SubtitleDisplayMode = 'bilingual';

export const createSourceLanguageOptions = (t: (key: string) => string): ASRSettingsOption<string>[] => [
  { label: t('AITools.SourceLanguageChineseEnglish'), value: 'zh' },
  { label: t('AITools.SourceLanguageEnglish'), value: 'en' },
  { label: t('AITools.SourceLanguageCantonese'), value: 'zh-yue' },
  { label: t('AITools.SourceLanguageVietnamese'), value: 'vi' },
  { label: t('AITools.SourceLanguageJapanese'), value: 'ja' },
  { label: t('AITools.SourceLanguageKorean'), value: 'ko' },
  { label: t('AITools.SourceLanguageIndonesian'), value: 'id' },
  { label: t('AITools.SourceLanguageThai'), value: 'th' },
  { label: t('AITools.SourceLanguagePortuguese'), value: 'pt' },
  { label: t('AITools.SourceLanguageTurkish'), value: 'tr' },
  { label: t('AITools.SourceLanguageArabic'), value: 'ar' },
  { label: t('AITools.SourceLanguageSpanish'), value: 'es' },
  { label: t('AITools.SourceLanguageHindi'), value: 'hi' },
  { label: t('AITools.SourceLanguageFrench'), value: 'fr' },
  { label: t('AITools.SourceLanguageMalay'), value: 'ms' },
  { label: t('AITools.SourceLanguageFilipino'), value: 'fil' },
  { label: t('AITools.SourceLanguageGerman'), value: 'de' },
  { label: t('AITools.SourceLanguageItalian'), value: 'it' },
  { label: t('AITools.SourceLanguageRussian'), value: 'ru' },
];

export const createTargetLanguageOptions = (t: (key: string) => string): ASRSettingsOption<string>[] => [
  { label: t('AITools.NoTranslation'), value: '' },
  { label: t('AITools.LanguageChineseSimplified'), value: 'zh' },
  { label: t('AITools.LanguageEnglish'), value: 'en' },
  { label: t('AITools.LanguageVietnamese'), value: 'vi' },
  { label: t('AITools.LanguageJapanese'), value: 'ja' },
  { label: t('AITools.LanguageKorean'), value: 'ko' },
  { label: t('AITools.LanguageIndonesian'), value: 'id' },
  { label: t('AITools.LanguageThai'), value: 'th' },
  { label: t('AITools.LanguagePortuguese'), value: 'pt' },
  { label: t('AITools.LanguageArabic'), value: 'ar' },
  { label: t('AITools.LanguageSpanish'), value: 'es' },
  { label: t('AITools.LanguageFrench'), value: 'fr' },
  { label: t('AITools.LanguageMalay'), value: 'ms' },
  { label: t('AITools.LanguageGerman'), value: 'de' },
  { label: t('AITools.LanguageItalian'), value: 'it' },
  { label: t('AITools.LanguageRussian'), value: 'ru' },
];
