import { useQuery } from '@tanstack/react-query';
import { getTodayDateString, useLessonStore } from '../store/lesson-store';
import { useOnboardingStore } from '../store/onboarding-store';
import { WordPair } from '../types/word-pairs';

// Query word-pairs content; include onboarding and performance signature to align caching
export function useWordPairsQuery(lessonId?: string) {
  const generateWordPairsContent = useLessonStore((s) => s.generateWordPairsContent);
  const getWordPairsState = useLessonStore((s) => s.getWordPairsState);
  const dailyPlan = useLessonStore((s) => s.dailyPlan);
  const onboarding = useOnboardingStore();

  // Build a stable, override-aware key using the lesson store helper
  const dayKey = getTodayDateString();

  // Derive initialData from store’s current set words to avoid cold-start flicker
  const wpState = lessonId ? getWordPairsState(lessonId) : null;
  const native = wpState?.nativeWords ?? [];
  const translations = wpState?.translationWords ?? [];
  const isPlanToday = (() => {
    if (!dailyPlan?.date) return false;
    const planDate = new Date(dailyPlan.date);
    const planDayKey = `${planDate.getFullYear()}-${String(planDate.getMonth() + 1).padStart(2, '0')}-${String(planDate.getDate()).padStart(2, '0')}`;
    return planDayKey === dayKey;
  })();
  const hasTodayStorePairs = isPlanToday && native.length > 0 && translations.length > 0;

  const buildInitialPairs = (): Record<string, WordPair[]> => {
    const len = Math.min(native.length, translations.length);
    const pairs: WordPair[] = Array.from({ length: len }, (_, i) => ({
      native: native[i],
      translation: translations[i],
    }));
    const currentKey = `set${(wpState?.currentSetIndex ?? 0) + 1}`;
    return { [currentKey]: pairs } as Record<string, WordPair[]>;
  };

  return useQuery({
    queryKey: [
      'wordPairs',
      lessonId ?? 'global',
      onboarding.targetLanguage ?? 'italian',
      onboarding.nativeLanguage ?? 'english',
      onboarding.languageLevel ?? 'beginner',
      onboarding.learningGoal ?? 'pronunciation',
      dayKey,
    ],
    queryFn: async () => {
      if (!lessonId) return {} as Record<string, WordPair[]>;
      return await generateWordPairsContent(lessonId);
    },
    // Seed with a minimal initial set based on persisted store content
    initialData: hasTodayStorePairs ? buildInitialPairs() : undefined,
    // 24h freshness window; disable auto refetch triggers
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Skip fetch if we already have today's pairs in the store
    enabled: !!lessonId && !hasTodayStorePairs,
  });
}