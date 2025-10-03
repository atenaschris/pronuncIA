import { useQuery } from '@tanstack/react-query';
import { useLessonStore } from '../store/lesson-store';

// Query word-pairs content; key by lessonId so navigation back/forth stays cached
export function useWordPairsQuery(lessonId?: string) {
  const generateWordPairsContent = useLessonStore((s) => s.generateWordPairsContent);

  return useQuery({
    queryKey: ['wordPairs', lessonId ?? 'global'],
    queryFn: async () => {
      return await generateWordPairsContent(lessonId ?? 'word-pairs');
    },
    // Fetch only when we have a lesson context
    enabled: true,
  });
}