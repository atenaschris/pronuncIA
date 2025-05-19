import { StyleSheet } from 'react-native';

import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';

export default function CreditsScreen() {
  return (
    <RNESafeAreaView style={[styles.container]}>
      <RNEText h1 style={styles.title}>Credits</RNEText>
      <RNEText h3 style={styles.subtitle}>
        Manage your learning credits
      </RNEText>
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