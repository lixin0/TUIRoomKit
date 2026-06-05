import type { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './IconButtonH5.module.scss';

export interface IconButtonH5Props {
  /** Title text rendered below the icon. */
  title: string;
  /** When true, disables interactions and lowers opacity. */
  disabled?: boolean;
  /** Icon element rendered above the title. */
  children?: ReactNode;
}

export function IconButtonH5({ title, disabled = false, children }: IconButtonH5Props) {
  return (
    <div
      className={classNames(styles.iconButtonH5, {
        [styles.disabled]: disabled,
      })}
    >
      {children}
      <span className={styles.title}>{title}</span>
    </div>
  );
}
