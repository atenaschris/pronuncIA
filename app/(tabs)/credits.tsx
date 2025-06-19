import { StyleSheet } from 'react-native';

import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNPText } from '@/components/ui/RNPText';

export default function CreditsScreen() {
  return (
    <RNESafeAreaView style={[styles.container]}>
      <RNPText variant="displayLarge" style={styles.title}>Credits</RNPText>
      <RNPText variant="headlineSmall" style={styles.subtitle}>
        Manage your learning credits
      </RNPText>
    </RNESafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
});