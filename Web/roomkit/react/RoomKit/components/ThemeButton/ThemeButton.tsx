import { IconSwitchTheme, useUIKit } from '@tencentcloud/uikit-base-component-react';
import { IconButton } from '../base/IconButton';

export function ThemeButton() {
  const { t, setTheme, theme } = useUIKit();

  const handleClickThemeIcon = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('tuiRoom-theme', newTheme);
  };

  return (
    <IconButton
      layout="horizontal"
      title={t('Theme.Title')}
      onClickIcon={handleClickThemeIcon}
    >
      <IconSwitchTheme size="20" />
    </IconButton>
  );
}
