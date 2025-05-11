import { Link } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useOnboardingStore } from '@/store/onboarding-store';

const TIME_OPTIONS = [
  { minutes: 5, label: '5 minutes' },
  { minutes: 10, label: '10 minutes' },
  { minutes: 15, label: '15 minutes' },
  { minutes: 20, label: '20 minutes' },
  { minutes: 30, label: '30 minutes' },
  { minutes: 45, label: '45 minutes' },
  { minutes: 60, label: '1 hour' },
];

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
    <ThemedView style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          Daily Practice Time
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          How much time can you dedicate to practice each day?
        </ThemedText>

        <View style={styles.optionsContainer}>
          {TIME_OPTIONS.map((option) => (
            <Animated.View
              key={option.minutes}
              style={[styles.timeButton, timeCommitment === option.minutes && styles.selectedTime]}
              onTouchEnd={() => setTimeCommitment(option.minutes)}
            >
              <ThemedText style={[styles.timeText, timeCommitment === option.minutes && styles.selectedText]}>
                {option.label}
              </ThemedText>
            </Animated.View>
          ))}
        </View>

        {timeCommitment && (
          <Link href="/onboarding/learning-style" style={styles.nextButton}>
            <ThemedText style={styles.nextButtonText}>Continue</ThemedText>
          </Link>
        )}
      </Animated.View>
    </ThemedView>
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
  optionsContainer: {
    gap: 12,
  },
  timeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '500',
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
    marginTop: 30,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
