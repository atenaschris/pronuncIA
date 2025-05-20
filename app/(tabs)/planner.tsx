import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { StyleSheet } from 'react-native';

export default function PlannerScreen() {
  return (
    <RNESafeAreaView style={[styles.container]}>
      <RNEText h1 style={styles.title} >Planner</RNEText>
      <RNEText h3 style={styles.subtitle}>
        Schedule your learning sessions
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