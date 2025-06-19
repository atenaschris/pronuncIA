import { RNPText } from '@/components/ui/RNPText';
import { RNPView } from '@/components/ui/RNPView';
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <RNPView style={styles.container}>
        <RNPText variant="displayLarge">This screen does not exist.</RNPText>
      <Link href="/" style={styles.link}>
        <RNPText variant="titleLarge">Go to home screen!</RNPText>
        </Link>
      </RNPView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
