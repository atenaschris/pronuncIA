import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { useLessonStore } from '@/lib/store/lesson-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';

export default function ProfileScreen() {
  const { 
    currentStreak, 
    streakFreezes, 
    maxStreakFreezes, 
    totalXp, 
    lastActivityDate,
    purchaseStreakFreeze,
    checkDailyGoalMet,
    dailyPlan
  } = useLessonStore();
  const theme = useAppTheme();

  const handlePurchaseStreakFreeze = () => {
    const success = purchaseStreakFreeze();
    if (success) {
      Alert.alert(
        'Streak Freeze Purchased!',
        'You now have an extra streak freeze to protect your learning streak.',
        [{ text: 'OK' }]
      );
    } else {
      if (streakFreezes >= maxStreakFreezes) {
        Alert.alert(
          'Maximum Reached',
          `You already have the maximum number of streak freezes (${maxStreakFreezes}).`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Insufficient XP',
          'You need 100 XP to purchase a streak freeze. Complete more lessons to earn XP!',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const formatLastActivityDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isDailyGoalMet = useMemo(() => checkDailyGoalMet(), [dailyPlan]);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <OnboardingTitle>Profile</OnboardingTitle>
        <OnboardingSubtitle style={{ marginBottom: 20 }}>Your learning statistics and achievements</OnboardingSubtitle>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Learning Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <RNPText style={styles.sectionTitle}>Learning Statistics</RNPText>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={24} color={theme.colors.primary} />
                <View style={styles.statContent}>
                  <RNPText style={styles.statNumber}>{currentStreak}</RNPText>
                  <RNPText style={styles.statLabel}>Day Streak</RNPText>
                </View>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="star" size={24} color={theme.colors.tertiary} />
                <View style={styles.statContent}>
                  <RNPText style={styles.statNumber}>{totalXp.toLocaleString()}</RNPText>
                  <RNPText style={styles.statLabel}>Total XP</RNPText>
                </View>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.activityRow}>
              <RNPText style={styles.activityLabel}>Last Activity:</RNPText>
              <RNPText style={styles.activityDate}>{formatLastActivityDate(lastActivityDate)}</RNPText>
            </View>
            
            <View style={styles.activityRow}>
              <RNPText style={styles.activityLabel}>Today's Goal:</RNPText>
              <View style={styles.goalStatus}>
                <MaterialCommunityIcons 
                  name={isDailyGoalMet ? "check-circle" : "clock-outline"} 
                  size={16} 
                  color={isDailyGoalMet ? theme.colors.primary : theme.colors.outline} 
                />
                <RNPText style={[styles.goalText, { color: isDailyGoalMet ? theme.colors.primary : theme.colors.outline }]}>
                  {isDailyGoalMet ? 'Completed' : 'In Progress'}
                </RNPText>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Streak Protection */}
        <Card style={styles.protectionCard}>
          <Card.Content>
            <View style={styles.protectionHeader}>
              <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
              <RNPText style={styles.sectionTitle}>Streak Protection</RNPText>
            </View>
            
            <View style={styles.freezeStatus}>
              <MaterialCommunityIcons name="snowflake" size={20} color={theme.colors.primary} />
              <RNPText style={styles.freezeText}>
                {streakFreezes} / {maxStreakFreezes} Streak Freezes Available
              </RNPText>
            </View>
            
            <RNPText style={styles.protectionDescription}>
              Streak freezes automatically protect your streak when you miss a day of learning. 
              They're used automatically when needed.
            </RNPText>
            
            {streakFreezes < maxStreakFreezes && (
              <Button 
                mode="outlined" 
                onPress={handlePurchaseStreakFreeze}
                style={styles.purchaseButton}
                icon="plus"
              >
                Buy Streak Freeze (100 XP)
              </Button>
            )}
            
            {streakFreezes >= maxStreakFreezes && (
              <RNPText style={[styles.maxReachedText, { color: theme.colors.primary }]}>
                ✓ You have the maximum number of streak freezes!
              </RNPText>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  protectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statContent: {
    marginLeft: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  goalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  freezeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  freezeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  protectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 16,
  },
  purchaseButton: {
    marginTop: 8,
  },
  maxReachedText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});