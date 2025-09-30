import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLessonStore } from '@/lib/store/lesson-store';
import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';

export default function ProgressScreen() {
  const { currentStreak, streakFreezes, maxStreakFreezes, totalXp, purchaseStreakFreeze } = useLessonStore();
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

  return (
    <SafeAreaView style={[styles.container]}>
      <View>
        <OnboardingTitle>Progress</OnboardingTitle>
        <OnboardingSubtitle style={{ marginBottom: 20 }}>Track your learning journey</OnboardingSubtitle>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Streak Information */}
        <Surface style={[styles.streakCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
          <View style={styles.streakHeader}>
            <MaterialCommunityIcons 
              name="fire" 
              size={32} 
              color={theme.colors.primary} 
            />
            <View style={styles.streakInfo}>
              <RNPText style={[styles.streakNumber, { color: theme.colors.primary }]}>
                {currentStreak}
              </RNPText>
              <RNPText style={[styles.streakLabel, { color: theme.colors.onPrimaryContainer }]}>
                Day Streak
              </RNPText>
            </View>
          </View>
          <RNPText style={[styles.streakDescription, { color: theme.colors.onPrimaryContainer }]}>
            Keep learning daily to maintain your streak!
          </RNPText>
        </Surface>

        {/* Streak Freezes */}
        <Card style={styles.freezeCard}>
          <Card.Content>
            <View style={styles.freezeHeader}>
              <MaterialCommunityIcons 
                name="snowflake" 
                size={24} 
                color={theme.colors.primary} 
              />
              <RNPText style={styles.freezeTitle}>Streak Freezes</RNPText>
            </View>
            
            <View style={styles.freezeInfo}>
              <RNPText style={styles.freezeCount}>
                {streakFreezes} / {maxStreakFreezes} available
              </RNPText>
              <RNPText style={styles.freezeDescription}>
                Streak freezes protect your streak when you miss a day of learning.
              </RNPText>
            </View>

            {streakFreezes < maxStreakFreezes && (
              <Button 
                mode="contained" 
                onPress={handlePurchaseStreakFreeze}
                style={styles.purchaseButton}
                icon="plus"
              >
                Purchase Streak Freeze (100 XP)
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* XP Information */}
        <Card style={styles.xpCard}>
          <Card.Content>
            <View style={styles.xpHeader}>
              <MaterialCommunityIcons 
                name="star" 
                size={24} 
                color={theme.colors.tertiary} 
              />
              <RNPText style={styles.xpTitle}>Total XP</RNPText>
            </View>
            <RNPText style={[styles.xpNumber, { color: theme.colors.tertiary }]}>
              {totalXp.toLocaleString()}
            </RNPText>
            <RNPText style={styles.xpDescription}>
              Earn XP by completing lessons and achieving high scores!
            </RNPText>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  streakCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakInfo: {
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  streakDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  freezeCard: {
    marginBottom: 16,
  },
  freezeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  freezeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  freezeInfo: {
    marginBottom: 16,
  },
  freezeCount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  freezeDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  purchaseButton: {
    marginTop: 8,
  },
  xpCard: {
    marginBottom: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  xpNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  xpDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});