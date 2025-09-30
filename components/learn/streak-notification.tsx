import { Alert } from 'react-native';
import { getTodayDateString, useLessonStore } from '../../lib/store/lesson-store';

interface StreakValidationResult {
  status: 'no_previous_activity' | 'streak_maintained' | 'freeze_used' | 'streak_lost' | 'gap_too_large';
  streakProtected?: number;
  freezesRemaining?: number;
  lostStreak?: number;
  gapDays?: number;
  freezesUsed?: number;
}

const showStreakNotification = (result: StreakValidationResult) => {
  switch (result.status) {
    case 'freeze_used':
      const freezesText = result.freezesRemaining === 1 ? '1 freeze' : `${result.freezesRemaining} freezes`;
      Alert.alert(
        '🧊 Streak Freeze Used',
        `Your ${result.streakProtected}-day streak was protected! You have ${freezesText} remaining.`,
        [{ text: 'Continue', style: 'default' }]
      );
      break;

    case 'streak_lost':
      const lostGapText = result.gapDays === 1 ? '1 day' : `${result.gapDays} days`;
      Alert.alert(
        '💔 Streak Lost',
        `Oh no! You lost your ${result.lostStreak}-day streak after missing ${lostGapText}. You didn't have enough streak freezes to cover the gap. Don't worry, you can start building a new one today!`,
        [{ text: 'Start Fresh', style: 'default' }]
      );
      break;

    case 'gap_too_large':
      Alert.alert(
        '⚠️ Gap Too Large',
        `You've been away for ${result.gapDays} days, which is beyond the maximum coverage limit (7 days). Your ${result.lostStreak}-day streak has been reset. Time to start fresh!`,
        [{ text: 'Start Over', style: 'default' }]
      );
      break;

    // No notifications needed for 'streak_maintained' and 'no_previous_activity'
    default:
      break;
  }
};

export const checkAndNotifyStreakStatus = (validateDailyStreak: () => StreakValidationResult) => {
  const { streakNotificationLastShown, setStreakNotificationLastShown } = useLessonStore.getState();
  const today = getTodayDateString();

  if (streakNotificationLastShown === today) {
    return;
  }

  const result = validateDailyStreak();

  if (result.status === 'freeze_used' || result.status === 'streak_lost' || result.status === 'gap_too_large') {
    showStreakNotification(result);
    setStreakNotificationLastShown(today);
  }

  return result;
};