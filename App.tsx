import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, LogBox, Modal, View, ActivityIndicator, Text, Alert } from 'react-native';
import CodePush from "react-native-code-push";
import Navigation from './src/navigation';
import { colors } from './src/theme/colors';
import Snackbar from './src/components/common/snackbar';
import { analyticsService } from './src/utils/analytics';
import { featureFlagsService } from './src/utils/featureFlags';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Warning: componentWillReceiveProps has been renamed',
]);

const App: React.FC = () => {
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>(
    'The app has been updated. Please restart to apply changes.'
  );
  const [checking, setChecking] = useState<boolean>(false);
  const [spinnerText, setSpinnerText] = useState<string>('Checking for updates…');
  const isMandatoryRef = React.useRef(false);

  useEffect(() => {
    // Initialize analytics
    analyticsService.startNewSession();
    analyticsService.setEnabled(featureFlagsService.isEnabled('enableAnalytics'));
    analyticsService.trackEvent('app_launched');

    // Check for CodePush updates
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: CodePush.InstallMode.ON_NEXT_RESTART,
        updateDialog: {
          title: 'Mandatory Update Available',
          mandatoryUpdateMessage: 'A new mandatory version is available. Please update to continue..',
          mandatoryContinueButtonLabel: 'Update Now',
        },
      },
      (syncStatus) => {
        switch (syncStatus) {
          case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
            setSpinnerText('Checking for updates…');
            setChecking(true);
            break;

          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            setSpinnerText('Downloading update…');
            setChecking(true);
            break;

          case CodePush.SyncStatus.INSTALLING_UPDATE:
            setSpinnerText('Installing update…');
            setChecking(true);
            break;

          case CodePush.SyncStatus.AWAITING_USER_ACTION:
            isMandatoryRef.current = true;   // mandatory dialog is shown
            setChecking(false);
            break;

          case CodePush.SyncStatus.UPDATE_INSTALLED:
            if (isMandatoryRef.current) {
              // Mandatory update: show spinner then restart automatically
              setSpinnerText('Restarting app…');
              setChecking(true);
              isMandatoryRef.current = false;
              setTimeout(() => CodePush.restartApp(), 800);
            } else {
              // Optional update: ask the user
              setChecking(false);
              Alert.alert(
                'Update installed',
                'Press Restart to apply. If you choose Later, the update will be applied on next restart.',
                [
                  { text: 'Restart', onPress: () => CodePush.restartApp() },
                  { text: 'Later', style: 'cancel' },
                ],
              );
            }
            break;

          case CodePush.SyncStatus.UP_TO_DATE:
            setChecking(false);
            Alert.alert('Your app is up to date ✅\n Continue using the app.');
            break;

          case CodePush.SyncStatus.UNKNOWN_ERROR:
            setChecking(false);
            Alert.alert('Error while checking updates');
            break;
        }
      },
    );

    // Check update status
    const checkUpdateStatus = async () => {
      try {
        const update = await CodePush.getUpdateMetadata();
        if (update) {
          analyticsService.trackEvent('codepush_update_status', {
            label: update.label,
            description: update.description,
            isFirstRun: update.isFirstRun,
          });
        }
      } catch (error) {
        console.error('Error checking update status:', error);
      }
    };

    checkUpdateStatus();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      <Navigation />
      
      <Snackbar
        visible={snackbarVisible}
        message={updateMessage}
        onDismiss={() => setSnackbarVisible(false)}
        actionLabel="Restart"
        onActionPress={() => CodePush.restartApp()}
        autoHide={false}
        swipeToDismiss
      />
      {/* Spinner while checking/downloading/installing updates */}
      <Modal visible={checking} transparent animationType="fade">
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.6)' }}>
          <View style={{ padding:24, borderRadius:12, backgroundColor:'rgba(0,0,0,0.8)', alignItems:'center' }}>
            <ActivityIndicator size="large" color="#ffffff" style={{ marginBottom:16 }} />
            <Text style={{ color:'#ffffff', fontSize:16, fontWeight:'600' }}>{spinnerText}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

// export default CodePush({
//   checkFrequency: CodePush.CheckFrequency.ON_APP_START,
//   installMode: CodePush.InstallMode.ON_NEXT_RESTART,
// })(App);

export default App;