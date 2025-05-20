import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { StyleSheet } from 'react-native';


export default function ProgressScreen() {
 
  return (
    <RNESafeAreaView style={[styles.container]}>
      <RNEText h1 style={styles.title}>Progress</RNEText>
      <RNEText h3 style={styles.subtitle}>
        Track your learning journey
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