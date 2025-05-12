import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { LANGUAGE_LEVEL_LABELS, LEARNING_GOAL_LABELS, LEARNING_STYLE_LABELS, NATIVE_LANGUAGE_LABELS } from '@/constants/constants';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function SummaryScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const [isLoading, setIsLoading] = useState(false);
  const { createProfile } = useAuthStore();
  const {
    languageLevel,
    nativeLanguage,
    learningGoal,
    timeCommitment,
    learningStyle,
    setIsComplete,
  } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 600 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Create profile in anonymous mode initially
      await createProfile({
        language_level: languageLevel,
        native_language: nativeLanguage,
        learning_goal: learningGoal,
        time_commitment: timeCommitment,
        learning_style: learningStyle,
      }, true); // Set asAnonymous to true

      setIsComplete(true);
      router.replace('/(tabs)');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          Your Learning Profile
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Here's a summary of your preferences
        </ThemedText>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.label}>English Level</ThemedText>
            <ThemedText style={styles.value}>{languageLevel ? LANGUAGE_LEVEL_LABELS[languageLevel] : '-'}</ThemedText>
          </View>

          <View style={styles.summaryItem}>
            <ThemedText style={styles.label}>Native Language</ThemedText>
            <ThemedText style={styles.value}>{nativeLanguage ? NATIVE_LANGUAGE_LABELS[nativeLanguage] : '-'}</ThemedText>
          </View>

          <View style={styles.summaryItem}>
            <ThemedText style={styles.label}>Learning Goal</ThemedText>
            <ThemedText style={styles.value}>{learningGoal ? LEARNING_GOAL_LABELS[learningGoal] : '-'}</ThemedText>
          </View>

          <View style={styles.summaryItem}>
            <ThemedText style={styles.label}>Daily Practice</ThemedText>
            <ThemedText style={styles.value}>
              {timeCommitment} {timeCommitment === 60 ? 'hour' : 'minutes'}
            </ThemedText>
          </View>

          <View style={styles.summaryItem}>
            <ThemedText style={styles.label}>Learning Style</ThemedText>
            <ThemedText style={styles.value}>{learningStyle ? LEARNING_STYLE_LABELS[learningStyle] : '-'}</ThemedText>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <TouchableOpacity style={styles.startButton} onPress={handleComplete} activeOpacity={0.7}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.startButtonText}>Start Learning</ThemedText>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
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
  summaryContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
