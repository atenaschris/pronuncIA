import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { RNEText } from '../ui/RNEText';
import { RNEView } from '../ui/RNEView';

interface ProgressHeaderProps {
  currentStreak: number;
  totalXp: number;
}

export function ProgressHeader({ currentStreak, totalXp }: ProgressHeaderProps) {
  return (
    <RNEView style={styles.container}>
      <View style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF9800" />
        <RNEText h3 style={styles.streakText}>{currentStreak} Day Streak</RNEText>
      </View>

      <View style={styles.xpContainer}>
        <MaterialCommunityIcons name="star" size={24} color="#4CAF50" />
        <RNEText h3 style={styles.xpText}>{totalXp} XP</RNEText>
      </View>
    </RNEView>
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
    fontWeight: 'bold',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontWeight: 'bold',
  },
});