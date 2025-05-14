import { StyleSheet } from 'react-native';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text } from 'react-native-paper';

export default function CreditsScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedSafeAreaView style={[styles.container]}>
      <Text style={[styles.title, { color: Colors[colorScheme!].text }]}>Credits</Text>
      <Text style={[styles.subtitle, { color: Colors[colorScheme!].text }]}>
        Manage your learning credits
      </Text>
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