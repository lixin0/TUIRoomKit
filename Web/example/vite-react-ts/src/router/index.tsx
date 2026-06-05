import { ComponentType, lazy, Suspense, useEffect, useRef } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  TUIMessageBox,
  useUIKit,
} from '@tencentcloud/uikit-base-component-react';
import {
  LoginStatus,
  useLoginState,
  useRoomState,
} from 'tuikit-atomicx-react/room';

const Login = lazy(() => import('@/views/login'));
const Home = lazy(
  () => import('@/views/home') as Promise<{ default: ComponentType<any> }>
);
const Room = lazy(
  () => import('@/views/room') as Promise<{ default: ComponentType<any> }>
);

// Leave-room confirmation when navigating away from /room while in a room.
const useLeaveRoomGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useUIKit();
  const { currentRoom, leaveRoom } = useRoomState();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    prevPathRef.current = location.pathname;

    if (
      prevPath === '/room' &&
      location.pathname !== '/room' &&
      currentRoom?.roomId
    ) {
      TUIMessageBox.confirm({
        type: 'warning',
        title: t('Room.LeaveRoomTitle'),
        content: t('Room.ConfirmLeavePage'),
        callback: async (action?: string) => {
          if (action === 'confirm') {
            await leaveRoom();
          } else {
            navigate(prevPath, { replace: true });
          }
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
};

// Auth gate: any non-/login path requires an active login session.
//
// We intentionally rely on the in-memory login store (`useLoginState`) here
// rather than `localStorage.tuiRoom-userInfo`. localStorage is shared across
// tabs of the same origin, so using it as the auth source-of-truth caused a
// cross-tab leak: when one tab was kicked offline and cleared the stored
// credential, every other tab's `RequireAuth` would re-read localStorage on
// its next render and incorrectly redirect to /login. The login store is
// per-tab, so each tab now owns its own auth state.
//
// `localStorage.tuiRoom-userInfo` is still used by `App.tsx`'s bootstrap
// effect as the auto-login credential; we peek at it below only to avoid
// flashing /login during the brief window between the initial render and the
// bootstrap `login()` call.
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const { loginUserInfo, status } = useLoginState();

  if (loginUserInfo?.userId) {
    return children;
  }

  const hasBootstrapCredential = !!localStorage.getItem('tuiRoom-userInfo');
  if (
    status === LoginStatus.LOADING ||
    (status === LoginStatus.IDLE && hasBootstrapCredential)
  ) {
    return null;
  }

  const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
};

export default function AppRouter() {
  useLeaveRoomGuard();

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/room"
          element={
            <RequireAuth>
              <Room />
            </RequireAuth>
          }
        />
      </Routes>
    </Suspense>
  );
}
