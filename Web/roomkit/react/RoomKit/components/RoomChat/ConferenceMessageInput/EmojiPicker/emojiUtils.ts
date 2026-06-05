import { i18next } from '@tencentcloud/uikit-base-component-react';
import { emojiUrlMap } from './emojiConstants';

/**
 * Transforms text containing emoji keys to localized emoji names.
 */
export function transformTextWithEmojiKeyToName(text: string) {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let transformResult: string = text;
  if (reg.test(text)) {
    transformResult = text.replace(
      reg,
      match => (emojiUrlMap[match] ? i18next.t(`Emoji.${match}`) : match),
    );
  }
  return transformResult;
}
