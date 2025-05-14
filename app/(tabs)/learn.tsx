import { StyleSheet } from 'react-native';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';

export default function LearnScreen() {
  return (
    <ThemedSafeAreaView style={[styles.container]}>
      <ThemedText type="title">Learn</ThemedText>
      <ThemedText type="subtitle">
        Start your daily lessons here
      </ThemedText>
    </ThemedSafeAreaView>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
});