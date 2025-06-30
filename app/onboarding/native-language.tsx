import { NextButton } from '@/components/ui/NextButton';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NATIVE_LANGUAGES } from '../../lib/constants/constants';
import { OnboardingList } from './components/OnboardingList';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';

export default function NativeLanguageScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setNativeLanguage, nativeLanguage } = useOnboardingStore();

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
        <OnboardingTitle>What's your native language?</OnboardingTitle>
        <OnboardingSubtitle>This helps us tailor pronunciation exercises to your needs</OnboardingSubtitle>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[animatedStyle]}>
          <OnboardingList
            options={NATIVE_LANGUAGES}
            selectedValue={nativeLanguage}
            onSelect={setNativeLanguage}
            containerStyle={styles.languagesContainer}
          />
        </Animated.View>
      </ScrollView>
      <NextButton
        onPress={() => router.push('/onboarding/learning-goals')}
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
