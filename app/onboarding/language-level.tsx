import { Link } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import type { LanguageLevel } from '@/store/onboarding-store';
import { useOnboardingStore } from '@/store/onboarding-store';
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
    <ThemedSafeAreaView style={[styles.container]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          What's your English level?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Select your current level to personalize your learning experience
        </ThemedText>

        <View style={styles.levelsContainer}>
          {LANGUAGE_LEVELS.map((level) => (
            <Animated.View
              key={level.id}
              style={[styles.levelButton, languageLevel === level.id && styles.selectedLevel]}
              onTouchEnd={() => setLanguageLevel(level.id as LanguageLevel)}
            >
              <ThemedText style={[styles.levelLabel, languageLevel === level.id && styles.selectedText]}>
                {level.label}
              </ThemedText>
              <ThemedText style={[styles.levelDescription, languageLevel === level.id && styles.selectedText]}>
                {level.description}
              </ThemedText>
            </Animated.View>
          ))}
        </View>

        {languageLevel && (
          <Link href="/onboarding/native-language" style={styles.nextButton}>
            <ThemedText style={styles.nextButtonText}>Continue</ThemedText>
          </Link>
        )}
      </Animated.View>
    </ThemedSafeAreaView>
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
  levelsContainer: {
    gap: 12,
  },
  levelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedLevel: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelDescription: {
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
