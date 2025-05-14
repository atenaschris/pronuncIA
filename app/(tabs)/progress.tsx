import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet } from 'react-native';


export default function ProgressScreen() {
 
  return (
    <ThemedSafeAreaView style={[styles.container]}>
      <ThemedText type="title">Progress</ThemedText>
      <ThemedText type="subtitle">
        Track your learning journey
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