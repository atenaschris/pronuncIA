import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNPText } from '@/components/ui/RNPText';
import { StyleSheet } from 'react-native';
export default function TutorsScreen() {

  return (
    <RNESafeAreaView style={[styles.container]}>
      <RNPText variant="displayLarge" style={styles.title}>Tutors</RNPText>
      <RNPText variant="headlineSmall"  style={styles.subtitle}>
        Connect with language experts
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