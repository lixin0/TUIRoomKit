import { useEffect } from 'react';
import { DeviceStatus, useDeviceState } from 'tuikit-atomicx-react/room';

export const STORAGE_KEY_CAMERA_STATUS = 'tuiRoom-cameraStatus';
export const STORAGE_KEY_MICROPHONE_STATUS = 'tuiRoom-microphoneStatus';

function getStoredBooleanPreference(key: string, defaultValue = true) {
  const value = sessionStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }
  return value === 'true';
}

const getMicrophonePreference = () =>
  getStoredBooleanPreference(STORAGE_KEY_MICROPHONE_STATUS);
const getCameraPreference = () =>
  getStoredBooleanPreference(STORAGE_KEY_CAMERA_STATUS);

const setMicrophonePreference = (isOpen: boolean) => {
  sessionStorage.setItem(
    STORAGE_KEY_MICROPHONE_STATUS,
    isOpen ? 'true' : 'false'
  );
};
const setCameraPreference = (isOpen: boolean) => {
  sessionStorage.setItem(STORAGE_KEY_CAMERA_STATUS, isOpen ? 'true' : 'false');
};

// Module-level baselines so the effect only writes on a real value change:
// the first observation just records the status (avoids clobbering a saved
// preference on mount), and StrictMode remounts / multiple consumers share
// the same baseline.
let lastSeenCameraStatus: DeviceStatus | undefined;
let lastSeenMicrophoneStatus: DeviceStatus | undefined;

export function useMediaPreference() {
  const { cameraStatus, microphoneStatus } = useDeviceState();

  useEffect(() => {
    if (lastSeenCameraStatus === undefined) {
      lastSeenCameraStatus = cameraStatus;
      return;
    }
    if (lastSeenCameraStatus === cameraStatus) {
      return;
    }
    lastSeenCameraStatus = cameraStatus;
    setCameraPreference(cameraStatus === DeviceStatus.On);
  }, [cameraStatus]);

  useEffect(() => {
    if (lastSeenMicrophoneStatus === undefined) {
      lastSeenMicrophoneStatus = microphoneStatus;
      return;
    }
    if (lastSeenMicrophoneStatus === microphoneStatus) {
      return;
    }
    lastSeenMicrophoneStatus = microphoneStatus;
    setMicrophonePreference(microphoneStatus === DeviceStatus.On);
  }, [microphoneStatus]);

  return {
    getMicrophonePreference,
    getCameraPreference,
    setMicrophonePreference,
    setCameraPreference,
  };
}
