import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { IconMore, useUIKit } from '@tencentcloud/uikit-base-component-react';
import { IconButton } from '../base/IconButton';
import styles from './MoreButton.module.scss';

interface MoreButtonProps {
  /** Overflow items rendered inside the popup panel. */
  children: ReactNode;
}

/**
 * Toolbar overflow button: shows a "More" trigger that toggles a popup
 * panel above the control bar containing the overflow items.
 */
export function MoreButton({ children }: MoreButtonProps) {
  const { t } = useUIKit();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={styles.moreButtonWrapper}>
      <IconButton
        title={t('RoomMore.Title')}
        icon={<IconMore size={24} />}
        onClickIcon={() => setIsOpen(prev => !prev)}
      />
      {isOpen && (
        <div
          className={styles.dropdownMenu}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
