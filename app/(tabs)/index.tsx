import { ScrollView, StyleSheet, View } from 'react-native';


import { LessonBlock } from '@/components/learn/lesson-block';
import { ProgressHeader } from '@/components/learn/progress-header';

import { RNPText } from '@/components/ui/RNPText';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import { RelativePathString, router } from 'expo-router';
import { useEffect } from 'react';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';

export default function LearnScreen() {
  const { dailyPlan, currentStreak, totalXp, generateDailyPlan, isLoading } = useLessonStore();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <OnboardingTitle>Daily Plan</OnboardingTitle>
        <OnboardingSubtitle>Your personalized learning path</OnboardingSubtitle>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProgressHeader currentStreak={currentStreak} totalXp={totalXp} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  scrollView: {
    flex: 1,
    paddingInline: 10
  },
  lessonGrid: {
    padding: 10,
    gap: 15,
  },
  lessonCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  lessonContent: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 12,
  },
  xpBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 20
  }
});