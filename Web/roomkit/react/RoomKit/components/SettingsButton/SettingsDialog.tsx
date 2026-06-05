import { useMemo, useState } from 'react';
import { TUIDialog, useUIKit } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import {
  AudioSettingPanel,
  VideoSettingPanel,
} from 'tuikit-atomicx-react/room';
import styles from './SettingsDialog.module.scss';

type SettingsTab = 'audio' | 'video';

export interface SettingsDialogProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDialog({ visible, onClose }: SettingsDialogProps) {
  const { t } = useUIKit();
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio');

  const tabs = useMemo<Array<{ label: string; value: SettingsTab }>>(
    () => [
      { label: t('Setting.AudioSetting'), value: 'audio' },
      { label: t('Setting.VideoSetting'), value: 'video' },
    ],
    [t],
  );

  return (
    <TUIDialog
      title={t('Settings.Title')}
      visible={visible}
      customClasses={[styles.customSettingDialog]}
      showConfirm={false}
      showCancel={false}
      teleported={false}
      onClose={onClose}
    >
      <div className={styles.settingBody}>
        <div className={styles.settingTabs}>
          {tabs.map(item => (
            <div
              key={item.value}
              className={classNames(styles.tabsTitle, {
                [styles.active]: activeTab === item.value,
              })}
              onClick={() => setActiveTab(item.value)}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className={styles.divideLine} />
        <div className={styles.settingContent}>
          {activeTab === 'audio' && (
            <AudioSettingPanel
              outputVolumeVisible={false}
            />
          )}
          {activeTab === 'video' && (
            <VideoSettingPanel />
          )}
        </div>
      </div>
    </TUIDialog>
  );
}
