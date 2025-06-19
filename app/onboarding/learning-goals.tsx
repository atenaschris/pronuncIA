import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LEARNING_GOALS } from '../../lib/constants/constants';
import { OnboardingList } from './components/OnboardingList';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';

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
          <OnboardingTitle>What's your learning goal?</OnboardingTitle>
          <OnboardingSubtitle>Choose your main focus for learning English pronunciation</OnboardingSubtitle>

          <OnboardingList
            options={LEARNING_GOALS}
            selectedValue={learningGoal}
            onSelect={setLearningGoal}
            containerStyle={styles.goalsContainer}
          />
        </Animated.View>
      </ScrollView>
      <NextButton
        onPress={() => router.push('/onboarding/time-commitment')}
      >
        Continue
      </NextButton>
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
