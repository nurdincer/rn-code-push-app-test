import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import Button from '../components/buttons/Button';
import Card from '../components/cards/Card';
import { analyticsService } from '../utils/analytics';
import { version as currentVersion } from '../../package.json';
import CodePush from '@appcircle/react-native-code-push';
import { featureFlagsService } from '../utils/featureFlags';
import { ActivityIndicator, Modal } from 'react-native';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [checking, setChecking] = useState(false);
  const [spinnerText, setSpinnerText] = useState('Checking for updates…');

  useEffect(() => {
    CodePush.notifyAppReady();
    analyticsService.trackScreenView('Home');
  }, []);

  const checkForUpdates = () => {
    CodePush.sync(
      {
        installMode: CodePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
        updateDialog: {
          title: 'Update Available',
          mandatoryUpdateMessage: 'A new version is available. Please update to continue.',
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
          case CodePush.SyncStatus.UPDATE_INSTALLED:
            setChecking(false);
            Alert.alert(
              'Update installed',
              'Please restart the app to apply the update. If you choose Later, the update will be applied on next restart.',
              [
                { text: 'Restart', onPress: () => CodePush.restartApp() },
                { text: 'Later', style: 'cancel' },
              ],
            );
            break;
          case CodePush.SyncStatus.UP_TO_DATE:
            setChecking(false);
            Alert.alert('App is up to date!');
            break;
          case CodePush.SyncStatus.UNKNOWN_ERROR:
            setChecking(false);
            Alert.alert('An error occurred while checking for updates');
            break;
        }
      }
    );

    analyticsService.trackEvent('check_for_updates');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Appcircle CodePush Staging Release</Text>
        <Text style={styles.subtitle}>Current Version: {currentVersion}</Text>
      </View>

      <Card title="App Features" style={styles.card}>
        <Text style={styles.cardText}>
          This app demonstrates CodePush integration for over-the-air updates.
          Navigate using the tabs below to explore different sections.
        </Text>
      </Card>

      <View style={styles.shortcuts}>
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.shortcutGrid}>
          <TouchableOpacity
            style={styles.shortcutItem}
            onPress={() => {
              navigation.navigate('Feed');
              analyticsService.trackEvent('shortcut_tap', { destination: 'feed' });
            }}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.primary }]}>
              <Text style={styles.shortcutIconText}>📱</Text>
            </View>
            <Text style={styles.shortcutText}>Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutItem}
            onPress={() => {
              navigation.navigate('Notifications');
              analyticsService.trackEvent('shortcut_tap', { destination: 'notifications' });
            }}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.warning }]}>
              <Text style={styles.shortcutIconText}>🔔</Text>
            </View>
            <Text style={styles.shortcutText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutItem}
            onPress={() => {
              navigation.navigate('Profile');
              analyticsService.trackEvent('shortcut_tap', { destination: 'profile' });
            }}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.success }]}>
              <Text style={styles.shortcutIconText}>👤</Text>
            </View>
            <Text style={styles.shortcutText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutItem}
            onPress={() => {
              checkForUpdates();
              analyticsService.trackEvent('shortcut_tap', { destination: 'updates' });
            }}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: colors.info }]}>
              <Text style={styles.shortcutIconText}>🔄</Text>
            </View>
            <Text style={styles.shortcutText}>Check Updates</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>About CodePush</Text>
        <Card style={styles.card}>
          <Text style={styles.cardText}>
            CodePush is a cloud service that enables React Native developers to deploy
            mobile app updates directly to their users' devices. It works by acting as a
            central repository where developers can publish updates, and from which apps
            can retrieve them using the provided SDK.
          </Text>
          <Button
            title="Learn More"
            variant="outline"
            size="small"
            onPress={() => {
              Alert.alert('CodePush Documentation', 'In a real app, this would link to the CodePush docs.');
              analyticsService.trackEvent('learn_more_tap', { topic: 'codepush' });
            }}
            style={styles.cardButton}
          />
        </Card>
      </View>

      {/* Spinner while checking/downloading/installing updates */}
      <Modal visible={checking} transparent animationType="fade">
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.6)' }}>
          <View style={{ padding:24, borderRadius:12, backgroundColor:'rgba(0,0,0,0.8)', alignItems:'center' }}>
            <ActivityIndicator size="large" color="#ffffff" style={{ marginBottom:16 }} />
            <Text style={{ color:'#ffffff', fontSize:16, fontWeight:'600' }}>{spinnerText}</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.dark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardText: {
    fontSize: typography.fontSizes.md,
    color: colors.dark,
    lineHeight: 22,
  },
  cardButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  shortcuts: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semiBold as any,
    color: colors.dark,
    marginBottom: spacing.md,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shortcutItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shortcutIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shortcutIconText: {
    fontSize: 24,
  },
  shortcutText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.dark,
  },
  codeSection: {
    marginBottom: spacing.lg,
  },
});

export default HomeScreen;
