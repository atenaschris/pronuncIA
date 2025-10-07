import { NextButton } from '@/components/ui/NextButton';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TARGET_LANGUAGES } from '../../lib/constants/constants';
import { OnboardingList } from './components/OnboardingList';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';

export default function TargetLanguageScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setTargetLanguage, targetLanguage, nativeLanguage } = useOnboardingStore();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Exclude the user's native language from target language options
  const filteredTargetLanguages = TARGET_LANGUAGES.filter(lang => lang.id !== nativeLanguage);

  return (
    <SafeAreaView style={[styles.container]}>
      <View>
        <OnboardingTitle>Which language do you want to learn?</OnboardingTitle>
        <OnboardingSubtitle>Choose the language you'd like to improve your pronunciation in</OnboardingSubtitle>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[animatedStyle]}>
          <OnboardingList
            options={filteredTargetLanguages}
            selectedValue={targetLanguage}
            onSelect={setTargetLanguage}
            containerStyle={styles.languagesContainer}
          />
        </Animated.View>
      </ScrollView>
      <NextButton
        onPress={() => router.push('/onboarding/language-level')}
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
  languagesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  nextButton: {
    marginHorizontal: 20,
    marginVertical: 20,
  },
});