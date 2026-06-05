import { useRef, useState } from 'react';
import type { ComponentType } from 'react';
import {
  IconArrowStrokeUp,
  IconNetworkDisconnected,
  IconNetworkFluctuation,
  IconNetworkLag,
  IconNetworkStability,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { NetworkQuality, useDeviceState } from 'tuikit-atomicx-react/room';
import { IconButton } from '../base/IconButton';
import { useClickOutside } from '../base/useClickOutside';
import styles from './LocalNetworkInfo.module.scss';

type NetworkStatusType = 'success' | 'warning' | 'danger' | 'disconnected';

interface NetworkState {
  title: string;
  type: NetworkStatusType;
  Icon: ComponentType<{ size?: string | number }>;
}

export function LocalNetworkInfo() {
  const { t } = useUIKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNetworkPanelVisible, setIsNetworkPanelVisible] = useState(false);

  const { networkInfo } = useDeviceState();

  useClickOutside(containerRef, () => {
    if (isNetworkPanelVisible) {
      setIsNetworkPanelVisible(false);
    }
  });

  const quality = networkInfo?.quality;
  const currentNetworkState = (() => {
    if (!networkInfo || quality === undefined || quality === NetworkQuality.Unknown) {
      return null;
    }
    const networkQualityMap: Record<NetworkQuality, NetworkState | undefined> = {
      [NetworkQuality.Unknown]: undefined,
      [NetworkQuality.Excellent]: {
        title: t('Network.Stability'),
        type: 'success',
        Icon: IconNetworkStability,
      },
      [NetworkQuality.Good]: {
        title: t('Network.Stability'),
        type: 'success',
        Icon: IconNetworkStability,
      },
      [NetworkQuality.Poor]: {
        title: t('Network.Fluctuation'),
        type: 'warning',
        Icon: IconNetworkFluctuation,
      },
      [NetworkQuality.Bad]: {
        title: t('Network.Lag'),
        type: 'danger',
        Icon: IconNetworkLag,
      },
      [NetworkQuality.VeryBad]: {
        title: t('Network.Lag'),
        type: 'danger',
        Icon: IconNetworkLag,
      },
      [NetworkQuality.Down]: {
        title: t('Network.Disconnected'),
        type: 'disconnected',
        Icon: IconNetworkDisconnected,
      },
    };
    return networkQualityMap[quality] ?? null;
  })();

  if (!currentNetworkState) {
    return null;
  }

  const { Icon, title, type } = currentNetworkState;

  function toggleNetworkPanel() {
    setIsNetworkPanelVisible(prev => !prev);
  }

  return (
    <div ref={containerRef} className={styles.networkInfoWrapper}>
      <IconButton
        layout="horizontal"
        onClickIcon={toggleNetworkPanel}
        titleSlot={(
          <span className={classNames(styles.networkTitle, styles[`status-${type}`])}>
            {title}
          </span>
        )}
      >
        <Icon size="20" />
      </IconButton>

      {isNetworkPanelVisible && (
        <div className={styles.networkPanel}>
          <div className={styles.panelItem}>
            <span className={styles.itemLabel}>{t('Network.Latency')}</span>
            <span
              className={classNames(
                styles.itemValue,
                styles.latencyValue,
                styles[`latency-value-${type}`],
              )}
            >
              {networkInfo?.delay}
              {' '}
              ms
            </span>
          </div>

          <div className={styles.panelItem}>
            <span className={styles.itemLabel}>{t('Network.PacketLoss')}</span>
            <div className={styles.packetLossContainer}>
              <div className={styles.packetLossItem}>
                <span className={styles.itemValue}>
                  {networkInfo?.upLoss}
                  %
                </span>
                <IconArrowStrokeUp className={classNames(styles.arrowIcon, styles.arrowUp)} />
              </div>
              <div className={styles.packetLossItem}>
                <span className={styles.itemValue}>
                  {networkInfo?.downLoss}
                  %
                </span>
                <IconArrowStrokeUp className={classNames(styles.arrowIcon, styles.arrowDown)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
