import { NextButton } from '@/components/ui/NextButton';
import { TIME_OPTIONS } from '@/lib/constants/constants';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { OnboardingList } from './components/OnboardingList';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';

export default function TimeCommitmentScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setTimeCommitment, timeCommitment } = useOnboardingStore();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[styles.container]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <OnboardingTitle>Daily Practice Time</OnboardingTitle>
          <OnboardingSubtitle>How much time can you dedicate to practice each day?</OnboardingSubtitle>
        <OnboardingList
          options={TIME_OPTIONS}
          selectedValue={timeCommitment}
          onSelect={setTimeCommitment}
          containerStyle={styles.optionsContainer}
        />
        </Animated.View>
      </ScrollView>
      <NextButton
        onPress={() => router.push('/onboarding/learning-style')}
      >Continue</NextButton>
    </View>
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

  optionsContainer: {
    gap: 12,
  },
});
