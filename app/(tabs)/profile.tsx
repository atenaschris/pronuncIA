import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <RNESafeAreaView style={styles.container}>
      <RNEView style={styles.header}>
        <RNEText h1 style={styles.title}>
          Profile
        </RNEText>
      </RNEView>

      <RNEView style={styles.content}>
        <RNEText h3 style={styles.text}>
          Your profile information and settings will appear here.
        </RNEText>
      </RNEView>
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