import { useQuery } from '@tanstack/react-query';

import { getTodayDateString, useLessonStore } from '../store/lesson-store';
import { useOnboardingStore } from '../store/onboarding-store';

// Query vocabulary content; include onboarding and performance signature to align caching
export function useVocabularyQuery(
  lessonId?: string
) {
  const generateVocabularyContent = useLessonStore((s) => s.generateVocabularyContent);
  const getVocabularyState = useLessonStore((s) => s.getVocabularyState);
  const dailyPlan = useLessonStore((s) => s.dailyPlan);
  const onboarding = useOnboardingStore();

  // Build a stable, daily key using the lesson store's override-aware helper
  const dayKey = getTodayDateString();

  // Derive initialData from MMKV-backed store to avoid cold-start flicker
  const vocabState = lessonId ? getVocabularyState(lessonId) : null;
  const storedWords = vocabState?.words ?? [];
  const isPlanToday = (() => {
    if (!dailyPlan?.date) return false;
    const planDate = new Date(dailyPlan.date);
    const planDayKey = `${planDate.getFullYear()}-${String(planDate.getMonth() + 1).padStart(2, '0')}-${String(planDate.getDate()).padStart(2, '0')}`;
    return planDayKey === dayKey;
  })();
  const hasTodayStoreWords = isPlanToday && storedWords.length > 0;

  return useQuery({
    queryKey: [
      'vocabulary',
      lessonId ?? 'global',
      onboarding.targetLanguage ?? 'italian',
      onboarding.nativeLanguage ?? 'english',
      onboarding.languageLevel ?? 'beginner',
      onboarding.learningGoal ?? 'pronunciation',
      dayKey,
    ],
    queryFn: async () => {
      if (!lessonId) return [];
      return await generateVocabularyContent(lessonId);
    },
    // Seed with persisted words when available for today's plan
    initialData: hasTodayStoreWords ? storedWords : undefined,
    // 24h freshness window; disable auto refetch triggers
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Skip fetch if we already have today's words in the store
    enabled: !!lessonId && !hasTodayStoreWords,
  });
}