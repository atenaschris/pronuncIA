import { StyleSheet } from 'react-native';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';

export default function PlannerScreen() {
  return (
    <ThemedSafeAreaView style={[styles.container]}>
      <ThemedText type="title">Planner</ThemedText>
      <ThemedText type="subtitle">
        Schedule your learning sessions
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