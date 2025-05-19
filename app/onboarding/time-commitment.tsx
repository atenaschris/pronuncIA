import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { H2, H4 } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { TIME_OPTIONS } from '@/constants/constants';
import { useOnboardingStore } from '@/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
    <RNESafeAreaView style={[styles.container]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <H2 style={styles.title}>
            Daily Practice Time
          </H2>
          <H4 style={styles.subtitle}>
            How much time can you dedicate to practice each day?
          </H4>

        <RNEView style={styles.optionsContainer}>
          {TIME_OPTIONS.map((option) => (
            <Animated.View
              key={option.minutes}
              style={[styles.timeButton, timeCommitment === option.minutes && styles.selectedTime]}
              onTouchEnd={() => setTimeCommitment(option.minutes)}
            >
              <H4 style={[styles.timeText, timeCommitment === option.minutes && styles.selectedText]}>
                {option.label}
              </H4>
            </Animated.View>
          ))}
        </RNEView>
        </Animated.View>
      </ScrollView>
      <NextButton
        title="Continue"
        onPress={() => router.push('/onboarding/learning-style')}
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
  optionsContainer: {
    gap: 12,
  },
  timeButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTime: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  timeText: {
    color: '#1a1a1a',
  },
  selectedText: {
    color: '#fff',
    opacity: 1,
  },
});
