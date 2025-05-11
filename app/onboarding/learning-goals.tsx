import { Link } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import type { LearningGoal } from '@/store/onboarding-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import type { OnboardingOption } from '@/types/onboarding';

type LearningGoalOption = OnboardingOption<LearningGoal>;

const LEARNING_GOALS: LearningGoalOption[] = [
  {
    id: 'travel',
    label: 'Travel & Tourism',
    description: 'Learn essential phrases for traveling and tourism',
  },
  {
    id: 'fluency',
    label: 'General Fluency', 
    description: 'Improve overall speaking ability and confidence',
  },
  {
    id: 'work',
    label: 'Professional Growth',
    description: 'Focus on business and workplace communication',
  },
  {
    id: 'exam',
    label: 'Exam Preparation',
    description: 'Prepare for English proficiency tests (IELTS, TOEFL)',
  },
];

export default function LearningGoalsScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setLearningGoal, learningGoal } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          What's your learning goal?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose your main focus for learning English pronunciation
        </ThemedText>

        <View style={styles.goalsContainer}>
          {LEARNING_GOALS.map((goal) => (
            <Animated.View
              key={goal.id}
              style={[styles.goalButton, learningGoal === goal.id && styles.selectedGoal]}
              onTouchEnd={() => setLearningGoal(goal.id)}
            >
              <ThemedText style={[styles.goalLabel, learningGoal === goal.id && styles.selectedText]}>
                {goal.label}
              </ThemedText>
              <ThemedText
                style={[styles.goalDescription, learningGoal === goal.id && styles.selectedText]}
              >
                {goal.description}
              </ThemedText>
            </Animated.View>
          ))}
        </View>

        {learningGoal && (
          <Link href="/onboarding/time-commitment" style={styles.nextButton}>
            <ThemedText style={styles.nextButtonText}>Continue</ThemedText>
          </Link>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  goalsContainer: {
    gap: 16,
  },
  goalButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedGoal: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  goalDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  selectedText: {
    color: 'white',
  },
  nextButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
