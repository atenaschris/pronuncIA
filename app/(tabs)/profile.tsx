import { RNPText } from '@/components/ui/RNPText';
import { StyleSheet, View } from 'react-native';


export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RNPText variant="displayLarge" style={styles.title}>
          Profile
        </RNPText>
      </View>

      <View style={styles.content}>
        <RNPText variant="headlineSmall" style={styles.text}>
          Your profile information and settings will appear here.
        </RNPText>
      </View>
    </View>
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