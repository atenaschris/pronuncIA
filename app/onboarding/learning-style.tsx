import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { H2, H4, H5 } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { useOnboardingStore } from '@/store/onboarding-store';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LEARNING_STYLES } from '../../constants/constants';

export default function LearningStyleScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { setLearningStyle, learningStyle } = useOnboardingStore();
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
            How do you learn best?
          </H2>
          <H4 style={styles.subtitle}>
            Select your preferred learning style for personalized exercises
          </H4>

          <RNEView style={styles.stylesContainer}>
            {LEARNING_STYLES.map((style) => (
              <Animated.View
                key={style.id}
                style={[styles.styleButton, learningStyle === style.id && styles.selectedStyle]}
                onTouchEnd={() => setLearningStyle(style.id)}
              >
                <H4 style={[styles.styleLabel, learningStyle === style.id && styles.selectedText]}>
                  {style.label}
                </H4>
                <H5 style={[styles.styleDescription, learningStyle === style.id && styles.selectedText]}>
                  {style.description}
                </H5>
              </Animated.View>
            ))}
          </RNEView>
        </Animated.View>
      </ScrollView>
      <NextButton
        title="Continue"
        onPress={() => router.push('/onboarding/summary')}
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
  stylesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  styleButton: {
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
  selectedStyle: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  styleLabel: {
    marginBottom: 8,
    color: '#1a1a1a',
  },
  styleDescription: {
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
