import { PreviewView } from './PreviewView';
import type { PreviewViewProps, PreviewViewUIOptions } from './PreviewView';

export type PreConferenceViewUIOptions = PreviewViewUIOptions;

export interface PreConferenceViewProps {
  /** Visual options forwarded to the underlying preview view. */
  uiOptions?: PreConferenceViewUIOptions;
  /** Fired when the user clicks "Logout" inside the login info dropdown. */
  onLogout?: PreviewViewProps['onLogout'];
  /** Fired after a fresh room id is generated for the local user to host. */
  onCreateRoom?: PreviewViewProps['onCreateRoom'];
  /** Fired after the local user resolves a valid room id to join. */
  onJoinRoom?: PreviewViewProps['onJoinRoom'];
  /** Fired whenever the camera test starts (`true`) or stops (`false`). */
  onCameraPreferenceChange?: PreviewViewProps['onCameraPreferenceChange'];
  /** Fired whenever the microphone test starts (`true`) or stops (`false`). */
  onMicrophonePreferenceChange?: PreviewViewProps['onMicrophonePreferenceChange'];
}

export function PreConferenceView(props: PreConferenceViewProps) {
  const {
    uiOptions,
    onLogout,
    onCreateRoom,
    onJoinRoom,
    onCameraPreferenceChange,
    onMicrophonePreferenceChange,
  } = props;

  return (
    <PreviewView
      uiOptions={uiOptions}
      onLogout={onLogout}
      onCreateRoom={onCreateRoom}
      onJoinRoom={onJoinRoom}
      onCameraPreferenceChange={onCameraPreferenceChange}
      onMicrophonePreferenceChange={onMicrophonePreferenceChange}
    />
  );
}
