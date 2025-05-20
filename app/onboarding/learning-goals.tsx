import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { H2, H4, H5 } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { useOnboardingStore } from '@/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LEARNING_GOALS } from '../../constants/constants';

export default function LearningGoalsScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setLearningGoal, learningGoal } = useOnboardingStore();
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <RNESafeAreaView style={[styles.container]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <H2 style={styles.title}>
            What's your learning goal?
          </H2>
          <H4 style={styles.subtitle}>
            Choose your main focus for learning English pronunciation
          </H4>

          <RNEView style={styles.goalsContainer}>
            {LEARNING_GOALS.map((goal) => (
              <Animated.View
                key={goal.id}
                style={[styles.goalButton, learningGoal === goal.id && styles.selectedGoal]}
                onTouchEnd={() => setLearningGoal(goal.id)}
              >
                <H4 style={[styles.goalLabel, learningGoal === goal.id && styles.selectedText]}>
                  {goal.label}
                </H4>
                <H5 style={[styles.goalDescription, learningGoal === goal.id && styles.selectedText]}>
                  {goal.description}
                </H5>
              </Animated.View>
            ))}
          </RNEView>
        </Animated.View>
      </ScrollView>
      <NextButton
        title="Continue"
        onPress={() => router.push('/onboarding/time-commitment')}
      />
    </RNESafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    marginBottom: 16,
    color: '#1a1a1a',
  },
  subtitle: {
    marginBottom: 40,
    opacity: 0.8,
    lineHeight: 24,
    color: '#4a4a4a',
  },
  goalsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  goalButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedGoal: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  goalLabel: {
    marginBottom: 8,
    color: '#1a1a1a',
  },
  goalDescription: {
    opacity: 0.8,
    lineHeight: 22,
    color: '#4a4a4a',
  },
  selectedText: {
    color: '#fff',
    opacity: 1,
  },
});
