import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { LessonBlock } from '@/components/learn/lesson-block';
import { ProgressHeader } from '@/components/learn/progress-header';
import { RNPText } from '@/components/ui/RNPText';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import { RelativePathString, router } from 'expo-router';
import { useEffect } from 'react';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';

export default function LearnScreen() {
  const {
    dailyPlan,
    currentStreak,
    totalXp,
    streakFreezes,
    generateDailyPlan,
    isLoading,
  } = useLessonStore();

  useEffect(() => {
    if (!dailyPlan) {
      generateDailyPlan();
    }
  }, []);

  const handleLessonPress = (lessonType: LessonType) => {    
    let routePath = lessonType.toLowerCase();
    if (lessonType === 'voice_journaling' || lessonType === 'word_pairs') {
      // Replace all underscores with hyphens for these specific lesson types
      routePath = lessonType.replaceAll('_', '-');
    }
    
    // Find the actual lesson ID from the daily plan
    const lesson = dailyPlan?.lessons.find(l => l.type === lessonType);
    const lessonId = lesson?.id || lessonType; // Fallback to lessonType if not found
    
    // Navigate to the lesson screen based on lessonType, using actual lessonId
    router.push({ pathname: `/lessons/${routePath}` as RelativePathString, params: { lessonId } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <OnboardingTitle>Daily Plan</OnboardingTitle>
        <OnboardingSubtitle style={{ marginBottom: 20 }}>Your personalized learning path</OnboardingSubtitle>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProgressHeader currentStreak={currentStreak} totalXp={totalXp} streakFreezes={streakFreezes} />
        {isLoading ? (
          <RNPText style={styles.loadingText}>Generating your daily plan...</RNPText>
        ) : dailyPlan?.lessons.map((lesson) => (
          <LessonBlock
            key={lesson.id}
            lesson={lesson}
            onPress={() => handleLessonPress(lesson.type)}
          />
        ))}
      </ScrollView>
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
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 20
  }
});