import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface ProgressHeaderProps {
  currentStreak: number;
  totalXp: number;
}

export function ProgressHeader({ currentStreak, totalXp }: ProgressHeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF9800" />
        <ThemedText style={styles.streakText}>{currentStreak} Day Streak</ThemedText>
      </View>

      <View style={styles.xpContainer}>
        <MaterialCommunityIcons name="star" size={24} color="#4CAF50" />
        <ThemedText style={styles.xpText}>{totalXp} XP</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});