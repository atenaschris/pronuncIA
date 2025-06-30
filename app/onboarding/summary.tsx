import { NextButton } from '@/components/ui/NextButton';
import { RNPText } from '@/components/ui/RNPText';
import { RNPView } from '@/components/ui/RNPView';
import { DAILY_PRACTICE_TIME_LABELS, LANGUAGE_LEVEL_LABELS, LEARNING_GOAL_LABELS, LEARNING_STYLE_LABELS, NATIVE_LANGUAGE_LABELS } from '@/lib/constants/constants';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function SummaryScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const [isLoading, setIsLoading] = useState(false);
  const { createOrUpsertProfile } = useAuthStore();
  const {
    languageLevel,
    nativeLanguage,
    learningGoal,
    timeCommitment,
    learningStyle,
    setIsComplete,
  } = useOnboardingStore();
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Create profile in anonymous mode initially
      await createOrUpsertProfile({
        language_level: languageLevel,
        native_language: nativeLanguage,
        learning_goal: learningGoal,
        time_commitment: timeCommitment,
        learning_style: learningStyle,
      }, true); // Set asAnonymous to true
      
      // Proceed with soft login strategy
      setIsComplete(true);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <RNPText variant="displayMedium" style={styles.title}>
            Summary
          </RNPText>
          <RNPText variant="titleLarge" style={styles.subtitle}>
            Review your information before continuing
          </RNPText>
          <RNPView style={styles.summaryContainer}>
            <RNPView style={styles.summaryItem}>
              <RNPText variant="titleMedium" style={styles.label}>English Level</RNPText>
              <RNPText variant="titleMedium" style={styles.value}>{languageLevel ? LANGUAGE_LEVEL_LABELS[languageLevel] : '-'}</RNPText>
            </RNPView>
            <RNPView style={styles.summaryItem}>
              <RNPText variant="titleMedium" style={styles.label}>Native Language</RNPText>
              <RNPText variant="titleMedium" style={styles.value}>{nativeLanguage ? NATIVE_LANGUAGE_LABELS[nativeLanguage] : '-'}</RNPText>
            </RNPView>
            <RNPView style={styles.summaryItem}>
              <RNPText variant="titleMedium" style={styles.label}>Learning Goal</RNPText>
              <RNPText variant="titleMedium" style={styles.value}>{learningGoal ? LEARNING_GOAL_LABELS[learningGoal] : '-'}</RNPText>
            </RNPView>
            <RNPView style={styles.summaryItem}>
              <RNPText variant="titleMedium" style={styles.label}>Daily Practice</RNPText>
              <RNPText variant="titleMedium" style={styles.value}>
                {timeCommitment ? DAILY_PRACTICE_TIME_LABELS[timeCommitment] : '-'}
              </RNPText>
            </RNPView>
            <RNPView style={styles.summaryItem}>
              <RNPText variant="titleMedium" style={styles.label}>Learning Style</RNPText>
              <RNPText variant="titleMedium" style={styles.value}>{learningStyle ? LEARNING_STYLE_LABELS[learningStyle] : '-'}</RNPText>
            </RNPView>
          </RNPView>
          {error && (
            <RNPView style={styles.errorContainer}>
              <RNPText variant="titleMedium" style={styles.errorText}>{error}</RNPText>
            </RNPView>
          )}
        </Animated.View>
      </ScrollView>
      <NextButton
        loading={isLoading}
        onPress={handleComplete}
      >Start Learning</NextButton>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  label: {
    opacity: 0.8,
    color: '#4a4a4a',
    fontSize: 16,
  },
  value: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontSize: 16,
  },
});
