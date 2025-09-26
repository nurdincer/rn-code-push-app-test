import {useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import CodePush from "react-native-code-push";

export const useCodePush = () => {
  const [isUpdateDownloaded, setUpdateDownloaded] = useState(false);
  const [isCheckingForUpdate, setCheckingForUpdate] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  console.log('isCheckingForUpdate', isCheckingForUpdate);

  const checkForUpdates = async () => {
    if (isDev) {
      return;
    } // Don't use CodePush in development environment

    setCheckingForUpdate(true);
    try {
      await CodePush.sync(
        {
          installMode: CodePush.InstallMode.ON_NEXT_RESTART,
          mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE, // default
        },
        status => {
          switch (status) {
            case CodePush.SyncStatus.UPDATE_INSTALLED:
              setUpdateDownloaded(true);
              break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
              throw new Error('[CodePush] 알 수 없는 오류 발생');
            default:
              console.log('[CodePush] 상태:', status);
          }
        },
      );

      await CodePush.notifyAppReady();
    } catch (error) {
      //
    } finally {
      setCheckingForUpdate(false); // Reset status
    }
  };

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check for updates only in active app state (debounce)
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          await checkForUpdates();
        }, 500); // 0.5초 지연
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Initial execution
    checkForUpdates();

    return () => {
      clearTimeout(debounceTimer);
      subscription.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isUpdateDownloaded,
    // Return update checking status
  };
};
