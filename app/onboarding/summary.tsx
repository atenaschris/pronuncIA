import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { H2, H4, H5 } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { LANGUAGE_LEVEL_LABELS, LEARNING_GOAL_LABELS, LEARNING_STYLE_LABELS, NATIVE_LANGUAGE_LABELS } from '@/constants/constants';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
      router.replace('/(tabs)');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RNESafeAreaView style={[styles.container]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <H2 style={styles.title}>
            Your Learning Profile
          </H2>
          <H4 style={styles.subtitle}>
            Here's a summary of your preferences
          </H4>

          <RNEView style={styles.summaryContainer}>
            <RNEView style={styles.summaryItem}>
              <H5 style={styles.label}>English Level</H5>
              <H5 style={styles.value}>{languageLevel ? LANGUAGE_LEVEL_LABELS[languageLevel] : '-'}</H5>
            </RNEView>

            <RNEView style={styles.summaryItem}>
              <H5 style={styles.label}>Native Language</H5>
              <H5 style={styles.value}>{nativeLanguage ? NATIVE_LANGUAGE_LABELS[nativeLanguage] : '-'}</H5>
            </RNEView>

            <RNEView style={styles.summaryItem}>
              <H5 style={styles.label}>Learning Goal</H5>
              <H5 style={styles.value}>{learningGoal ? LEARNING_GOAL_LABELS[learningGoal] : '-'}</H5>
            </RNEView>

            <RNEView style={styles.summaryItem}>
              <H5 style={styles.label}>Daily Practice</H5>
              <H5 style={styles.value}>
                {timeCommitment} {timeCommitment === 60 ? 'hour' : 'minutes'}
              </H5>
            </RNEView>

            <RNEView style={styles.summaryItem}>
              <H5 style={styles.label}>Learning Style</H5>
              <H5 style={styles.value}>{learningStyle ? LEARNING_STYLE_LABELS[learningStyle] : '-'}</H5>
            </RNEView>
          </RNEView>

          {error && (
            <RNEView style={styles.errorContainer}>
              <H5 style={styles.errorText}>{error}</H5>
            </RNEView>
          )}
        </Animated.View>
      </ScrollView>
      <NextButton
        title="Start Learning"
        loading={isLoading}
        onPress={handleComplete}
      />
    </RNESafeAreaView>
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
    padding: 20,
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    opacity: 0.8,
  },
  value: {
    fontWeight: 'bold',
  },
});
