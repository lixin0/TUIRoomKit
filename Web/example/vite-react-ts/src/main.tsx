import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { i18next } from '@tencentcloud/uikit-base-component-react';
import App from '@/App';
import { enResource, zhResource } from '@/i18n';

export const addI18n = (lng: string, resource: any, deep = true, overwrite = false) => {
  i18next.addResourceBundle(lng, 'translation', resource.translation, deep, overwrite);
};

addI18n('en-US', { translation: enResource }, true, true);
addI18n('zh-CN', { translation: zhResource }, true, true);

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
