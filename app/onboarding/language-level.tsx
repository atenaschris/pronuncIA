import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { H2, H4, H5 } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import type { LanguageLevel } from '@/store/onboarding-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LANGUAGE_LEVELS } from '../../constants/constants';


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
          <H2 style={styles.title}>
            What's your English level?
          </H2>
          <H4 style={styles.subtitle}>
            Select your current level to personalize your learning experience
          </H4>

          <RNEView style={styles.levelsContainer}>
            {LANGUAGE_LEVELS.map((level) => (
              <Animated.View
                key={level.id}
                style={[styles.levelButton, languageLevel === level.id && styles.selectedLevel]}
                onTouchEnd={() => setLanguageLevel(level.id as LanguageLevel)}
              >
                <H4 style={[styles.levelLabel, languageLevel === level.id && styles.selectedText]}>
                  {level.label}
                </H4>
                <H5 style={[styles.levelDescription, languageLevel === level.id && styles.selectedText]}>
                  {level.description}
                </H5>
              </Animated.View>
            ))}
          </RNEView>
        </Animated.View>
      </ScrollView>
      <NextButton
        title="Continue"
        onPress={() => router.push('/onboarding/native-language')}
      />
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
