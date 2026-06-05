import { useRef, useState } from 'react';
import { IconLayout, useUIKit } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import {
  RoomLayoutTemplate,
  useRoomParticipantState,
} from 'tuikit-atomicx-react/room';
import { IconButton } from '../base/IconButton';
import { useClickOutside } from '../base/useClickOutside';
import styles from './LayoutButton.module.scss';

export interface LayoutButtonProps {
  /** Currently selected layout template. Treated as a controlled prop. */
  layout?: RoomLayoutTemplate;
  /** Fired when the user picks a different layout template. */
  onLayoutChange?: (layout: RoomLayoutTemplate) => void;
}

export function LayoutButton({ layout, onLayoutChange }: LayoutButtonProps) {
  const { t } = useUIKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLayoutList, setShowLayoutList] = useState(false);

  const { participantList } = useRoomParticipantState();

  const isDisabled = participantList.length < 2;

  useClickOutside(containerRef, () => {
    if (showLayoutList) {
      setShowLayoutList(false);
    }
  });

  function handleClick(changeLayout: RoomLayoutTemplate) {
    onLayoutChange?.(changeLayout);
  }

  function handleClickLayoutIcon() {
    if (isDisabled) {
      return;
    }
    setShowLayoutList(prev => !prev);
  }

  return (
    <div ref={containerRef} className={styles.layoutContainer}>
      <IconButton
        title={t('Layout.Title')}
        disabled={isDisabled}
        layout="horizontal"
        onClickIcon={handleClickLayoutIcon}
      >
        <IconLayout size="20" />
      </IconButton>
      {showLayoutList && (
        <div className={styles.layoutList}>
          {/* Sidebar and upper sidebar arrows */}
          <div
            className={classNames(styles.layout1, styles.layoutItem, {
              [styles.checked]: layout === RoomLayoutTemplate.GridLayout,
            })}
            onClick={() => handleClick(RoomLayoutTemplate.GridLayout)}
          >
            <div className={styles.layoutBlockContainer}>
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className={styles.layoutBlock} />
              ))}
            </div>
            <span className={styles.layoutTitle}>{t('Layout.Grid')}</span>
          </div>
          {/* Right side member list */}
          <div
            className={classNames(styles.layout2, styles.layoutItem, {
              [styles.checked]: layout === RoomLayoutTemplate.SidebarLayout,
            })}
            onClick={() => handleClick(RoomLayoutTemplate.SidebarLayout)}
          >
            <div className={styles.layoutBlockContainer}>
              <div className={styles.leftContainer} />
              <div className={styles.rightContainer}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.layoutBlock} />
                ))}
              </div>
            </div>
            <span className={styles.layoutTitle}>{t('Layout.GalleryRight')}</span>
          </div>
          {/* Top Member List */}
          <div
            className={classNames(styles.layout3, styles.layoutItem, {
              [styles.checked]: layout === RoomLayoutTemplate.CinemaLayout,
            })}
            onClick={() => handleClick(RoomLayoutTemplate.CinemaLayout)}
          >
            <div className={styles.layoutBlockContainer}>
              <div className={styles.topContainer}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.layoutBlock} />
                ))}
              </div>
              <div className={styles.bottomContainer} />
            </div>
            <span className={styles.layoutTitle}>{t('Layout.GalleryTop')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
