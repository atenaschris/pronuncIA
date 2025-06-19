import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNPText } from '@/components/ui/RNPText';
import { RNPView } from '@/components/ui/RNPView';
import { StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <RNESafeAreaView style={styles.container}>
      <RNPView style={styles.header}>
        <RNPText variant="displayLarge" style={styles.title}>
          Profile
        </RNPText>
      </RNPView>

      <RNPView style={styles.content}>
        <RNPText variant="headlineSmall" style={styles.text}>
          Your profile information and settings will appear here.
        </RNPText>
      </RNPView>
    </RNESafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    opacity: 0.8,
  },
});