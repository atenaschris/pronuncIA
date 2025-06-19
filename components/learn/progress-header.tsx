import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { RNPText } from '../ui/RNPText';
import { RNPView } from '../ui/RNPView';
import { useAppTheme } from '../ui/theme';

interface ProgressHeaderProps {
  currentStreak: number;
  totalXp: number;
}

export function ProgressHeader({ currentStreak, totalXp }: ProgressHeaderProps) {
  const theme = useAppTheme();
  const dynamicStyles = {
    container: {
      shadowColor: theme.colors.primary
    }
  }
  return (
    <RNPView style={[styles.container, dynamicStyles.container]}>
      <View style={styles.streakContainer}>
        <MaterialCommunityIcons name="fire" size={40} color="#FF9800" />
        <RNPText variant="titleMedium">{currentStreak} Day Streak</RNPText>
      </View>

      <View style={styles.xpContainer}>
        <MaterialCommunityIcons name="star" size={24} color="#4CAF50" />
        <RNPText variant="titleMedium">{totalXp} XP</RNPText>
      </View>
    </RNPView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 30,
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