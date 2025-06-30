import { NextButton } from '@/components/ui/NextButton';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEARNING_STYLES } from '../../lib/constants/constants';
import { OnboardingList } from './components/OnboardingList';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';

export default function LearningStyleScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setLearningStyle, learningStyle } = useOnboardingStore();
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView style={[styles.container]}>
      <View>
        <OnboardingTitle>How do you learn best?</OnboardingTitle>
        <OnboardingSubtitle>Select your preferred learning style for personalized exercises</OnboardingSubtitle>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[animatedStyle]}>
          <OnboardingList
            options={LEARNING_STYLES}
            selectedValue={learningStyle}
            onSelect={setLearningStyle}
            containerStyle={styles.stylesContainer}
          />
        </Animated.View>
      </ScrollView>
      <NextButton
        onPress={() => router.push('/onboarding/summary')}
      >
        Continue
      </NextButton>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stylesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  styleButton: {
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
  selectedStyle: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  styleLabel: {
    marginBottom: 8,
    color: '#1a1a1a',
  },
  styleDescription: {
    opacity: 0.8,
    lineHeight: 22,
    color: '#4a4a4a',
  },
  selectedText: {
    color: '#fff',
    opacity: 1,
  },
  nextButton: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
});
