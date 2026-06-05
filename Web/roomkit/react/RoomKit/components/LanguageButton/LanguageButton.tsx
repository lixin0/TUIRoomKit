import { IconLanguage, useUIKit } from '@tencentcloud/uikit-base-component-react';
import styles from './LanguageButton.module.scss';

export function LanguageButton() {
  const { setLanguage, language } = useUIKit();

  const handleClickLanguageIcon = () => {
    const newLanguage = language === 'en-US' ? 'zh-CN' : 'en-US';
    setLanguage(newLanguage);
    localStorage.setItem('tuiRoom-language', newLanguage);
  };

  return (
    <div className={styles.languageButton} onClick={handleClickLanguageIcon}>
      <IconLanguage />
      <span>{language === 'en-US' ? 'English' : '中文'}</span>
    </div>
  );
}
