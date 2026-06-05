import { useEffect, useRef, useState } from 'react';
import {
  Button,
  IconScreenSharing,
  MessageBox,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { useDeviceState } from 'tuikit-atomicx-react/room';
import styles from './LocalScreenViewUI.module.scss';

const MINI_REGION_HEIGHT_THRESHOLD = 200;

export function LocalScreenViewUI() {
  const { t } = useUIKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMiniRegion, setIsMiniRegion] = useState(false);
  const { stopScreenShare } = useDeviceState();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      setIsMiniRegion(container.offsetHeight <= MINI_REGION_HEIGHT_THRESHOLD);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleStopSharing() {
    MessageBox.confirm({
      title: t('ScreenShare.EndSharing'),
      content: t('ScreenShare.StopSharingConfirm'),
      callback: async (action) => {
        if (action === 'confirm') {
          await stopScreenShare();
        }
      },
    });
  }

  return (
    <div ref={containerRef} className={styles.localScreenContainer}>
      <div
        className={classNames(styles.controlContainer, {
          [styles.controlContainerMini]: isMiniRegion,
        })}
      >
        <div className={styles.info}>
          <IconScreenSharing size="44" />
          <span className={styles.text}>{t('RoomView.YouAreSharingTheScreen')}</span>
        </div>
        <Button color="red" type="primary" onClick={handleStopSharing}>
          {t('RoomView.EndSharing')}
        </Button>
      </div>
    </div>
  );
}
