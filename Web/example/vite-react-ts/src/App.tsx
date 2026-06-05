import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  TUIMessageBox,
  UIKitProvider,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import { useRoomInvitation } from '@tencentcloud/roomkit-web-react';
import {
  LoginEvent,
  useLoginState,
  useRoomModal,
} from 'tuikit-atomicx-react/room';
import AppRouter from '@/router';
import { getUrlParam } from '@/utils/utils';
import '@/utils/vConsoleExportLog';
import '@/styles/base.scss';

const InnerApp = () => {
  const { t } = useUIKit();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, subscribeEvent, unsubscribeEvent } = useLoginState();
  const { handleErrorWithModal } = useRoomModal();
  const bootstrappedRef = useRef(false);

  // Subscribe to incoming room calls. The React RoomKit currently only ships
  // a single `useRoomInvitation` (no separate H5 variant), so both PC and H5
  // share the same hook; route to /room when the call is accepted.
  //
  // The hook returns a React node that renders the invitation toast via a
  // portal. Rendering it inside this component keeps it within the host app's
  // React tree, so the invitation inherits `UIKitProvider` and friends.
  const roomInvitation = useRoomInvitation({
    onAcceptCall: ({ roomId, password, roomType }) => {
      const search = new URLSearchParams();
      search.set('roomId', roomId);
      if (password) search.set('password', password);
      if (roomType !== undefined && roomType !== null) {
        search.set('roomType', String(roomType));
      }
      navigate(`/room?${search.toString()}`);
    },
  });

  // Subscribe to login expired / kicked offline events so the user is
  // notified and redirected to /login when their session becomes invalid.
  // NOTE: do NOT clear `tuiRoom-userInfo` from localStorage here. localStorage
  // is shared across all tabs of the same origin, so removing it would also
  // log out unrelated tabs (e.g. the tab that just "won" the kick race). The
  // per-tab auth source of truth lives in the in-memory login store (see
  // `useLoginState` usage in `RequireAuth`), which is naturally tab-scoped.
  useEffect(() => {
    const onLoginExpired = () => {
      TUIMessageBox.alert({
        title: t('Login.Expired'),
        content: t('Login.ExpiredDescription'),
      });
      navigate('/login', { replace: true });
    };
    const onKickedOffline = () => {
      TUIMessageBox.alert({
        title: t('Login.KickedOffline'),
        content: t('Login.KickedOfflineDescription'),
      });
      navigate('/login', { replace: true });
    };
    subscribeEvent(LoginEvent.onLoginExpired, onLoginExpired);
    subscribeEvent(LoginEvent.onKickedOffline, onKickedOffline);
    return () => {
      unsubscribeEvent(LoginEvent.onLoginExpired, onLoginExpired);
      unsubscribeEvent(LoginEvent.onKickedOffline, onKickedOffline);
    };
  }, [subscribeEvent, unsubscribeEvent, navigate, t]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    if (location.pathname === '/login') return;

    const storedData = localStorage.getItem('tuiRoom-userInfo') || '{}';
    const userInfo = JSON.parse(storedData);
    if (!userInfo?.userID) return;

    login({
      userId: userInfo.userID,
      userSig: userInfo.userSig,
      sdkAppId: userInfo.SDKAppID,
      testEnv: Boolean(getUrlParam('testEnv')),
    }).catch((error: any) => {
      console.error('Login failed:', error);
      handleErrorWithModal(error);
      localStorage.removeItem('tuiRoom-userInfo');
      const redirect = encodeURIComponent(
        `${location.pathname}${location.search}`
      );
      navigate(`/login?redirect=${redirect}`, { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="app">
      <AppRouter />
      {roomInvitation}
    </div>
  );
};

export default function App() {
  const [initialTheme] = useState(
    () => localStorage.getItem('tuiRoom-theme') || 'light'
  );
  const [initialLanguage] = useState(
    () => localStorage.getItem('tuiRoom-language') || ''
  );

  return (
    <UIKitProvider
      theme={initialTheme as any}
      language={initialLanguage as any}
    >
      <InnerApp />
    </UIKitProvider>
  );
}
