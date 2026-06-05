import {
  TUIDropdown,
  TUIDropdownItem,
  IconCaretDownSmall,
  Toast,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { Avatar, useLoginState } from 'tuikit-atomicx-react/room';
import styles from './LoginUserInfo.module.scss';

export interface LoginUserInfoProps {
  /** Whether to show the logout entry in a dropdown. Defaults to `true`. */
  showLogout?: boolean;
  /** Fired after a successful logout (toast already shown, storage already cleared). */
  onLogout?: () => void;
}

export function LoginUserInfo({ showLogout = true, onLogout }: LoginUserInfoProps) {
  const { t } = useUIKit();
  const { loginUserInfo, logout } = useLoginState();

  const handleCommand = async (command: string | number | object) => {
    if (command === 'logout') {
      try {
        await logout();
        localStorage.removeItem('tuiRoom-userInfo');
        Toast.success({ message: t('LoginUserInfo.LogoutSuccess') });
        onLogout?.();
      } catch (_error) {
        Toast.error({ message: t('LoginUserInfo.LogoutFailed') });
      }
    }
  };

  const trigger = (
    <div className={styles.trigger}>
      <Avatar src={loginUserInfo?.avatarUrl} size={28} />
      <span
        className={styles.userId}
        title={loginUserInfo?.userName || loginUserInfo?.userId}
      >
        {loginUserInfo?.userName || loginUserInfo?.userId}
      </span>
      {showLogout && <IconCaretDownSmall size="24" />}
    </div>
  );

  return (
    <div className={styles.loginUserInfo}>
      {showLogout
        ? (
          <TUIDropdown
            trigger="click"
            placement="bottom-end"
            teleported={false}
            onCommand={handleCommand}
            dropdownContent={(
              <TUIDropdownItem command="logout">
                {t('LoginUserInfo.Logout')}
              </TUIDropdownItem>
            )}
          >
            {trigger}
          </TUIDropdown>
        )
        : (
          trigger
        )}
    </div>
  );
}
