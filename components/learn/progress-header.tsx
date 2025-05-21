import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';
import { RNEText } from '../ui/RNEText';
import { RNEView } from '../ui/RNEView';

interface ProgressHeaderProps {
  currentStreak: number;
  totalXp: number;
}

export function ProgressHeader({ currentStreak, totalXp }: ProgressHeaderProps) {
  const { theme } = useTheme()
  const dynamicStyles = {
    container: {
      shadowColor: theme.colors.primary
    }
  }
  return (
    <RNEView style={[styles.container, dynamicStyles.container]}>
      <RNEView style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={40} color="#FF9800" />
        <RNEText h4>{currentStreak} Day Streak</RNEText>
      </RNEView>

      <RNEView style={styles.xpContainer}>
        <MaterialCommunityIcons name="star" size={24} color="#4CAF50" />
        <RNEText h4>{totalXp} XP</RNEText>
      </RNEView>
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
    elevation: 6  ,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});