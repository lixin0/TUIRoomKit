import { useState } from 'react';
import { IconSetting, useUIKit } from '@tencentcloud/uikit-base-component-react';
import { IconButton } from '../base/IconButton';
import { SettingsDialog } from './SettingsDialog';

export function SettingsButton() {
  const { t } = useUIKit();
  const [visible, setVisible] = useState(false);

  const handleShow = () => setVisible(true);
  const handleClose = () => setVisible(false);

  return (
    <>
      <IconButton title={t('Settings.Title')} onClickIcon={handleShow}>
        <IconSetting size="24" />
      </IconButton>
      {visible && <SettingsDialog visible={visible} onClose={handleClose} />}
    </>
  );
}
