import { TUIToast, useUIKit } from '@tencentcloud/uikit-base-component-react';
import { copyText } from '../utils/utils';

/**
 * Hook for copy functionality with toast notification.
 * @returns Copy function with toast notification
 */
export function useCopy() {
  const { t } = useUIKit();

  const copy = async (value: string) => {
    const success = await copyText(value);
    if (success) {
      TUIToast.info({ message: t('Copy Success') });
    } else {
      TUIToast.error({ message: t('Copy Failed') });
    }
  };

  return {
    copy,
  };
}
