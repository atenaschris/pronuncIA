import { ScrollView, StyleSheet } from 'react-native';

import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { LessonBlock } from '@/components/learn/lesson-block';
import { ProgressHeader } from '@/components/learn/progress-header';
import { useLessonStore } from '@/store/lesson-store';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function LearnScreen() {
  const { dailyPlan, currentStreak, totalXp, generateDailyPlan, completeLesson, isLoading } = useLessonStore();

  useEffect(() => {
    if (!dailyPlan) {
      generateDailyPlan();
    }
  }, []);

  const handleLessonPress = (lesson: any) => {
    // TODO: Navigate to specific lesson screen based on type
    router.push(`/lesson/${lesson.type}`);
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Daily Plan</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Your personalized learning path
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProgressHeader currentStreak={currentStreak} totalXp={totalXp} />
        
        {isLoading ? (
          <ThemedText style={styles.loadingText}>Generating your daily plan...</ThemedText>
        ) : dailyPlan?.lessons.map((lesson) => (
          <LessonBlock
            key={lesson.id}
            lesson={lesson}
            onPress={handleLessonPress}
          />
        ))}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
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