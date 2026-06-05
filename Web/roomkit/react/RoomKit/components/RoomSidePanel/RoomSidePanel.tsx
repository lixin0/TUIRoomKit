import { Fragment } from 'react';
import { IconClose } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import styles from './RoomSidePanel.module.scss';
import type { SidePanelConfig } from '../../hooks/useRoomSidePanel';

export interface RoomSidePanelProps {
  /** Panel header title. */
  title: string;
  /** Extra class names applied to the root element (e.g. slide-in positioning). */
  className?: string;
  /** Fired when the close icon is clicked. */
  onClose?: () => void;
  /** Id of the currently open side panel. */
  activeId: string | null;
  /** Registered side panels to render inside the content area. */
  panels: SidePanelConfig[];
}

export function RoomSidePanel({
  title,
  className,
  onClose,
  activeId,
  panels,
}: RoomSidePanelProps) {
  return (
    <div className={classNames(styles.roomSidePanel, className)}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <IconClose
          size="16"
          className={styles.close}
          onClick={onClose}
        />
      </div>
      <div className={styles.content}>
        {panels.map((panel) => {
          const isActive = activeId === panel.id;
          const shouldMount = panel.keepAlive || isActive;
          if (!shouldMount) {
            return null;
          }
          // Mirror Vue `v-if` + `v-show` on `<component :is="...">` — no wrapper
          // div around the panel root; visibility is handled on the panel itself.
          return (
            <Fragment key={panel.id}>
              {panel.render({ isActive, keepAlive: panel.keepAlive })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
