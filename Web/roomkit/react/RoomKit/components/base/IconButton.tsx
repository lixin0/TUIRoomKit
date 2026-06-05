import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { IconArrowUp } from '@tencentcloud/uikit-base-component-react';
import classNames from 'classnames';
import { isMobile } from '../../utils/utils';
import styles from './IconButton.module.scss';

export type IconButtonLayout = 'horizontal' | 'vertical';

export interface IconButtonProps {
  /** Title text rendered next to the icon. */
  title?: string;
  /** Icon element rendered inside the button (e.g. `<IconChat size="20" />`). */
  icon?: ReactNode;
  /** Whether to render an extra "more" arrow on the right. */
  hasMore?: boolean;
  /** When true, disables interactions and lowers opacity. */
  disabled?: boolean;
  /** Layout direction. Defaults to `vertical`. */
  layout?: IconButtonLayout;
  /** Extra content appended after the title (e.g. badge). Hidden on mobile. */
  titleSlot?: ReactNode;
  /** Slot rendered before the icon. */
  children?: ReactNode;
  /** Fired when the icon area is clicked. */
  onClickIcon?: () => void;
  /** Fired when the "more" arrow is clicked. */
  onClickMore?: () => void;
}

export function IconButton({
  title = '',
  icon,
  hasMore = false,
  disabled = false,
  layout = 'vertical',
  titleSlot,
  children,
  onClickIcon,
  onClickMore,
}: IconButtonProps) {
  const handleClickIcon = useCallback(() => {
    onClickIcon?.();
  }, [onClickIcon]);

  const handleClickMore = useCallback(() => {
    onClickMore?.();
  }, [onClickMore]);

  const contentClassName = classNames(
    styles.content,
    layout === 'horizontal' ? styles.contentHorizontal : styles.contentVertical,
    { [styles.disabled]: disabled },
  );

  const iconNode = children ?? icon;
  const showTitle = Boolean(title) || (!isMobile && titleSlot);

  return (
    <div className={styles.iconButton}>
      <div className={contentClassName} onClick={handleClickIcon}>
        {iconNode ? <div className={styles.iconSlot}>{iconNode}</div> : null}
        {showTitle
          ? (
            <span className={styles.title}>
              {title}
              {!isMobile && titleSlot}
            </span>
          )
          : null}
      </div>
      {hasMore && (
        <div className={styles.arrow} onClick={handleClickMore}>
          <IconArrowUp size="12" />
        </div>
      )}
    </div>
  );
}
