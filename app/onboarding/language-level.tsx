import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LANGUAGE_LEVELS } from '../../lib/constants/constants';
import { OnboardingList } from './components/OnboardingList';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';


export default function LanguageLevelScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setLanguageLevel, languageLevel } = useOnboardingStore();
  
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
          <OnboardingTitle>What's your English level?</OnboardingTitle>
          <OnboardingSubtitle>Select your current level to personalize your learning experience</OnboardingSubtitle>

          <OnboardingList
            options={LANGUAGE_LEVELS}
            selectedValue={languageLevel}
            onSelect={setLanguageLevel}
            containerStyle={styles.levelsContainer}
          />
        </Animated.View>
      </ScrollView>
      <NextButton
        onPress={() => router.push('/onboarding/native-language')}
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  
  levelsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  levelButton: {
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
  selectedLevel: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  levelLabel: {
    marginBottom: 8,
    color: '#1a1a1a',
  },
  levelDescription: {
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
