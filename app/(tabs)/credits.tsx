import { StyleSheet, View } from 'react-native';

import { RNPText } from '@/components/ui/RNPText';

export default function CreditsScreen() {
  return (
    <View style={[styles.container]}>
      <RNPText variant="displayLarge" style={styles.title}>Credits</RNPText>
      <RNPText variant="headlineSmall" style={styles.subtitle}>
        Manage your learning credits
      </RNPText>
    </View>
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