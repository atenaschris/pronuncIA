import { Link } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import type { NativeLanguageCode } from '@/store/onboarding-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import type { OnboardingOption } from '@/types/onboarding';

type NativeLanguageOption = OnboardingOption<NativeLanguageCode>;

const NATIVE_LANGUAGES: NativeLanguageOption[] = [
  { id: 'it', label: 'Italian', description: 'Romance language with melodic pronunciation and clear vowel sounds' },
  { id: 'es', label: 'Spanish', description: 'Romance language with consistent pronunciation rules' },
  { id: 'fr', label: 'French', description: 'Romance language with unique nasal sounds and silent letters' },
  { id: 'de', label: 'German', description: 'Germanic language with strong consonants and compound words' },
  { id: 'pt', label: 'Portuguese', description: 'Romance language with distinctive nasal vowels and soft consonants' },
  { id: 'ru', label: 'Russian', description: 'Slavic language with complex consonant clusters and soft/hard sounds' },
  { id: 'zh', label: 'Chinese', description: 'Tonal language with unique phonetic system and character-based writing' },
  { id: 'ja', label: 'Japanese', description: 'Pitch-accent language with simple phonetic structure' },
  { id: 'ko', label: 'Korean', description: 'Agglutinative language with unique alphabet and pronunciation rules' },
  { id: 'ar', label: 'Arabic', description: 'Semitic language with rich phonetic system and distinctive sounds' },
];

export default function NativeLanguageScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setNativeLanguage, nativeLanguage } = useOnboardingStore();
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
      <Animated.View style={[styles.header, animatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          What's your native language?
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          This helps us tailor pronunciation exercises to your needs
        </ThemedText>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.languagesContainer, animatedStyle]}>
          {NATIVE_LANGUAGES.map((language) => (
            <Animated.View
              key={language.id}
              style={[styles.languageButton, nativeLanguage === language.id && styles.selectedLanguage]}
              onTouchEnd={() => setNativeLanguage(language.id)}
            >
              <ThemedText
                style={[styles.languageLabel, nativeLanguage === language.id && styles.selectedText]}
              >
                {language.label}
              </ThemedText>
              <ThemedText
                style={[styles.languageDescription, nativeLanguage === language.id && styles.selectedText]}
              >
                {language.description}
              </ThemedText>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>

      {nativeLanguage && (
        <Link href="/onboarding/learning-goals" style={styles.nextButton}>
          <ThemedText style={styles.nextButtonText}>Continue</ThemedText>
        </Link>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  languagesContainer: {
    paddingBottom: 20,
    gap: 12,
  },
  languageButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  languageDescription: {
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
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
