/**
 * Performance metrics and spaced repetition utility functions
 * Extracted from lesson-store.ts for better code organization
 */

import type { DailyPlan, Lesson, LessonType } from '../store/lesson-store';
import type { VocabularyState } from '../types/vocabulary';
import type { WordPairsState } from '../types/word-pairs';
import { inferSoundFromWord } from './sound-mapping-utils';

// Performance metrics calculation
export interface PerformanceMetrics {
  // Lifetime (cumulative across all activity)
  completionRate: number; // lifetime completion rate
  averageAccuracy: number; // lifetime average accuracy
  preferredLessonTypes: LessonType[];
  strugglingAreas: LessonType[];
  totalLessonsLifetime: number;
  completedLessonsLifetime: number;
}

// Removed daily snapshot memoization; metrics are computed fresh each call

export const calculateUserPerformanceMetrics = (state: {
  dailyPlan: DailyPlan | null;
  lifetimeLessonsSeen: number;
  lifetimeLessonsCompleted: number;
  lifetimeAccuracyTotal: number;
  lifetimeAccuracyCount: number;
  lifetimeLessonTypeStats?: Record<LessonType, { total: number; completed: number; accuracyTotal: number; accuracyCount: number }>;
}): PerformanceMetrics => {

  // Fast path: if this is the very first run (no daily lessons and no lifetime evidence),
  // return baseline metrics to avoid unnecessary processing.
  const hasLifetimeEvidence = !!state.lifetimeLessonsSeen || !!state.lifetimeLessonsCompleted || !!state.lifetimeAccuracyCount
    || Object.values(state.lifetimeLessonTypeStats || {}).some((s) => s.total > 0 || s.completed > 0 || s.accuracyCount > 0);
  if (!hasLifetimeEvidence) {
    return {
      completionRate: 0,
      averageAccuracy: 0,
      preferredLessonTypes: [],
      strugglingAreas: [],
      totalLessonsLifetime: 0,
      completedLessonsLifetime: 0,
    };
  }

  // Preferences and struggles computed solely from lifetime per-type stats
  const lifetimeStats = state.lifetimeLessonTypeStats || {} as Record<LessonType, { total: number; completed: number; accuracyTotal: number; accuracyCount: number }>;

  const preferredLessonTypes = Object.entries(lifetimeStats)
    .filter(([_, s]) => {
      const rate = s.total > 0 ? (s.completed / s.total) : 0;
      const acc = s.accuracyCount > 0 ? Math.round(s.accuracyTotal / s.accuracyCount) : 0;
      return rate >= 0.7 || acc >= 70;
    })
    .map(([type]) => type as LessonType);

  const strugglingAreas = Object.entries(lifetimeStats)
    .filter(([_, s]) => {
      const rate = s.total > 0 ? (s.completed / s.total) : 0;
      const acc = s.accuracyCount > 0 ? Math.round(s.accuracyTotal / s.accuracyCount) : 0;
      return rate < 0.5 || (acc > 0 && acc < 60);
    })
    .map(([type]) => type as LessonType);

  // --------------------------------------
  // Lifetime metrics (cumulative across user’s activity)
  // --------------------------------------
  const totalLessonsLifetime = state.lifetimeLessonsSeen || 0;
  const completedLessonsLifetime = state.lifetimeLessonsCompleted || 0;
  const completionRateLifetime = totalLessonsLifetime > 0
    ? Math.round((completedLessonsLifetime / totalLessonsLifetime) * 100)
    : 0;

  const averageAccuracyLifetime = (state.lifetimeAccuracyCount || 0) > 0
    ? Math.round((state.lifetimeAccuracyTotal || 0) / state.lifetimeAccuracyCount)
    : 0;

  return {
    // Lifetime (used by existing prompt fields to avoid daily reset)
    completionRate: completionRateLifetime,
    averageAccuracy: averageAccuracyLifetime,
    preferredLessonTypes,
    strugglingAreas,
    totalLessonsLifetime,
    completedLessonsLifetime,
  };
};

// Spaced repetition data calculation
export interface SpacedRepetitionData {
  vocabularyReview: string[];
  pronunciationReview: string[];
  difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
}

// Removed spaced repetition memoization; compute fresh each call

// Make difficulty selection lifetime-aware while keeping review lists daily-scoped
export const calculateSpacedRepetitionNeeds = (state: {
  dailyPlan: DailyPlan | null;
  lifetimeAccuracyTotal?: number;
  lifetimeAccuracyCount?: number;
  lifetimeLessonsSeen?: number;
  lifetimeLessonsCompleted?: number;
  // Persisted date-keyed log to provide review backlog when no daily activity evidence
  performanceLog?: PerformanceLog;
}): SpacedRepetitionData => {
  const { dailyPlan } = state;
  const INCREASE_THRESHOLD = 85;
  const DECREASE_THRESHOLD = 60;

  // Compute lifetime average accuracy if available
  const lifetimeAvgAccuracy = (state.lifetimeAccuracyCount || 0) > 0
    ? (state.lifetimeAccuracyTotal || 0) / (state.lifetimeAccuracyCount || 0)
    : null;
  
  if (!dailyPlan || !dailyPlan.lessons.length) {
    // Even with no lessons to analyze, adapt difficulty based on lifetime accuracy if present
    let difficultyAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';
    if (typeof lifetimeAvgAccuracy === 'number') {
      if (lifetimeAvgAccuracy >= INCREASE_THRESHOLD) {
        difficultyAdjustment = 'increase';
      } else if (lifetimeAvgAccuracy < DECREASE_THRESHOLD) {
        difficultyAdjustment = 'decrease';
      }
    }

    // Fallback to persisted review backlog from today's log entry when available
    let vocabularyReview: string[] = [];
    let pronunciationReview: string[] = [];
    if (state.performanceLog) {
      const todayKey = getDateKey(new Date());
      const dailySummary = summarizeDailyFromLog(state.performanceLog, todayKey);
      vocabularyReview = dailySummary.vocabularyReviewDaily || [];
      pronunciationReview = dailySummary.pronunciationReviewDaily || [];

      // If today's log is empty, fallback to lifetime backlog
      if (vocabularyReview.length === 0 && pronunciationReview.length === 0) {
        const lifetimeSummary = summarizeLifetimeFromLog(state.performanceLog);
        vocabularyReview = lifetimeSummary.vocabularyReviewLifetime || [];
        pronunciationReview = lifetimeSummary.pronunciationReviewLifetime || [];
      }
    }

    const result: SpacedRepetitionData = {
      vocabularyReview,
      pronunciationReview,
      difficultyAdjustment,
    };
    return result;
  }

  // If there are lessons but no evidence of activity (no completions or accuracy/errors),
  // short-circuit to empty reviews and lifetime-based difficulty adjustment.
  const hasAnyActivityEvidence = (dailyPlan?.lessons || []).some((lesson: Lesson) => {
    if (!lesson.completed || !lesson.sessionState) return false;
    if (lesson.type === 'pronunciation') {
      // Completed pronunciation counts as activity, even without per-sound accuracy yet
      return true;
    }
    if (lesson.type === 'vocabulary') {
      const vs = lesson.sessionState as VocabularyState;
      return !!(vs.failedWords?.length || vs.skippedWords?.length || vs.aiScores?.length);
    }
    if (lesson.type === 'word_pairs') {
      const wps = lesson.sessionState as WordPairsState;
      const hasErrors = !!(wps.errorDetails?.incorrectMatches?.length);
      const hasScores = Array.isArray(lesson.setBestScores) && lesson.setBestScores.length > 0;
      return hasErrors || hasScores;
    }
    return false;
  });

  if (!hasAnyActivityEvidence) {
    let difficultyAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';
    if (typeof lifetimeAvgAccuracy === 'number') {
      if (lifetimeAvgAccuracy >= INCREASE_THRESHOLD) {
        difficultyAdjustment = 'increase';
      } else if (lifetimeAvgAccuracy < DECREASE_THRESHOLD) {
        difficultyAdjustment = 'decrease';
      }
    }

    // Fallback to persisted backlog when no daily evidence exists
    let vocabularyReview: string[] = [];
    let pronunciationReview: string[] = [];
    if (state.performanceLog) {
      const todayKey = getDateKey(new Date());
      const dailySummary = summarizeDailyFromLog(state.performanceLog, todayKey);
      vocabularyReview = dailySummary.vocabularyReviewDaily || [];
      pronunciationReview = dailySummary.pronunciationReviewDaily || [];

      if (vocabularyReview.length === 0 && pronunciationReview.length === 0) {
        const lifetimeSummary = summarizeLifetimeFromLog(state.performanceLog);
        vocabularyReview = lifetimeSummary.vocabularyReviewLifetime || [];
        pronunciationReview = lifetimeSummary.pronunciationReviewLifetime || [];
      }
    }

    const result: SpacedRepetitionData = {
      vocabularyReview,
      pronunciationReview,
      difficultyAdjustment,
    };
    return result;
  }

  const vocabularyReview: string[] = [];
  const pronunciationReview: string[] = [];
  
  // Analyze completed lessons for spaced repetition needs
  dailyPlan.lessons.forEach((lesson: Lesson) => {
    if (lesson.completed && lesson.sessionState) {
      // Vocabulary lessons - identify failed/skipped words for review
      if (lesson.type === 'vocabulary') {
        const vocabState = lesson.sessionState as VocabularyState;
        
        // Add failed words to review list
        if (vocabState.failedWords?.length > 0) {
          vocabState.words?.forEach((word, index: number) => {
            if (vocabState.failedWords.includes(index)) {
              vocabularyReview.push(word.word || `word_${index}`);
              // Also schedule the target sound for pronunciation practice
              if (word.targetSound) {
                pronunciationReview.push(`/${word.targetSound}/`);
              }
            }
          });
        }
        
        // Add skipped words to review list
        if (vocabState.skippedWords?.length > 0) {
          vocabState.words?.forEach((word, index: number) => {
            if (vocabState.skippedWords.includes(index)) {
              vocabularyReview.push(word.word || `word_${index}`);
              // Also schedule the target sound for pronunciation practice
              if (word.targetSound) {
                pronunciationReview.push(`/${word.targetSound}/`);
              }
            }
          });
        }
        
        // Add low-scoring sounds to pronunciation review
        if (vocabState.aiScores?.length > 0) {
          vocabState.aiScores.forEach((score, idx) => {
            if (score < 70 && vocabState.words?.[idx]?.targetSound) {
              pronunciationReview.push(`/${vocabState.words[idx].targetSound}/`);
            }
          });
        }
      }
      
      // Pronunciation lessons - add baseline sounds for review
      if (lesson.type === 'pronunciation') {
        // Until PronunciationState collects per-sound accuracy, use common English phonemes
        // These align with early practice targets and existing sound mapping utils
        pronunciationReview.push('/θ/', '/ð/', '/r/', '/l/');
      }
      
  // Word pairs lessons - identify incorrect matches for vocabulary review
  if (lesson.type === 'word_pairs') {
    const wordPairsState = lesson.sessionState as WordPairsState;
    if (wordPairsState.errorDetails?.incorrectMatches?.length > 0) {
      wordPairsState.errorDetails.incorrectMatches.forEach((error) => {
        // From word-pairs errors, schedule the English translation for vocabulary review.
        const normalized = (error.correctTranslation || '').trim().toLowerCase();
        if (normalized) {
          vocabularyReview.push(normalized);
        }

            // Prefer targetSound captured at error time; otherwise reuse from today's vocabulary then infer.
            const lower = error.correctTranslation.toLowerCase();
            let targetSound: string | null = error.targetSound ?? null;

            if (!targetSound) {
              // Try to find the word among today's vocabulary lessons to reuse its targetSound
              const vocabLessons = (dailyPlan?.lessons || []).filter((l) => l.type === 'vocabulary');
              for (const vLesson of vocabLessons) {
                const vs = vLesson.sessionState as VocabularyState | undefined;
                const match = vs?.words?.find((w) => (w.word || '').toLowerCase() === lower);
                if (match?.targetSound) {
                  targetSound = match.targetSound;
                  break;
                }
              }
            }

            // If not found in today's vocabulary, infer a reasonable sound target
            if (!targetSound) {
              const inferred = inferSoundFromWord(lower, 'en');
              if (inferred?.targetSound && inferred.targetSound !== 'general') {
                targetSound = inferred.targetSound;
              }
            }

            if (targetSound) {
              pronunciationReview.push(`/${targetSound}/`);
            }
          });
        }

        // Word-pairs accuracy no longer contributes to difficulty; rely on lifetime accuracy
      }
    }
  });

  // Determine difficulty adjustment based solely on lifetime accuracy
  let difficultyAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';

  const effectiveAccuracy = lifetimeAvgAccuracy;

  if (typeof effectiveAccuracy === 'number') {
    if (effectiveAccuracy >= INCREASE_THRESHOLD) {
      difficultyAdjustment = 'increase';
    } else if (effectiveAccuracy < DECREASE_THRESHOLD) {
      difficultyAdjustment = 'decrease';
    }
  }

  // Remove duplicates from review lists
  const uniqueVocabularyReview = [...new Set(vocabularyReview)];
  const uniquePronunciationReview = [...new Set(pronunciationReview)];

  // If reviews are empty despite activity, consult persisted backlog (today → lifetime)
  let finalVocabularyReview = uniqueVocabularyReview;
  let finalPronunciationReview = uniquePronunciationReview;
  if (finalVocabularyReview.length === 0 && finalPronunciationReview.length === 0 && state.performanceLog) {
    const todayKey = getDateKey(new Date());
    const dailySummary = summarizeDailyFromLog(state.performanceLog, todayKey);
    finalVocabularyReview = dailySummary.vocabularyReviewDaily || [];
    finalPronunciationReview = dailySummary.pronunciationReviewDaily || [];

    if (finalVocabularyReview.length === 0 && finalPronunciationReview.length === 0) {
      const lifetimeSummary = summarizeLifetimeFromLog(state.performanceLog);
      finalVocabularyReview = lifetimeSummary.vocabularyReviewLifetime || [];
      finalPronunciationReview = lifetimeSummary.pronunciationReviewLifetime || [];
    }
  }

  const result: SpacedRepetitionData = {
    vocabularyReview: finalVocabularyReview,
    pronunciationReview: finalPronunciationReview,
    difficultyAdjustment
  };
  return result;
};

// -----------------------------------------------------------
// Date-keyed performance log to support daily views from lifetime data
// -----------------------------------------------------------
export interface TypeStats { total: number; completed: number; accuracyTotal: number; accuracyCount: number }
export interface PerformanceLogEntry {
  lessonsSeen: number;
  lessonsCompleted: number;
  accuracyTotal: number;
  accuracyCount: number;
  xpEarned: number;
  streakFreezesUsed?: number;
  // Persisted review backlog for the day (deduped per entry)
  vocabularyReviewItems: string[];
  pronunciationReviewItems: string[];
  byType: Record<LessonType, TypeStats>;
}
export type PerformanceLog = Record<string, PerformanceLogEntry>; // key: YYYY-MM-DD

const blankTypeStats = (): Record<LessonType, TypeStats> => ({
  vocabulary: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
  listening: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
  pronunciation: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
  roleplay: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
  shadowing: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
  voice_journaling: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
  word_pairs: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
});

export const initPerformanceLogEntry = (): PerformanceLogEntry => ({
  lessonsSeen: 0,
  lessonsCompleted: 0,
  accuracyTotal: 0,
  accuracyCount: 0,
  xpEarned: 0,
  streakFreezesUsed: 0,
  vocabularyReviewItems: [],
  pronunciationReviewItems: [],
  byType: blankTypeStats(),
});

export const getDateKey = (date?: string | Date): string => {
  if (typeof date === 'string') {
    // Expecting YYYY-MM-DD; if not, normalize via Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Date(date).toISOString().slice(0, 10);
  }
  return new Date(date || Date.now()).toISOString().slice(0, 10);
};

// Roll up a generated plan into the performance log for its date
export const rollUpGeneratedPlanToLog = (log: PerformanceLog, plan: DailyPlan): PerformanceLog => {
  const dateKey = getDateKey(plan.date);
  const next: PerformanceLog = { ...log };
  const entry: PerformanceLogEntry = next[dateKey] ? { ...next[dateKey], byType: { ...next[dateKey].byType } } : initPerformanceLogEntry();

  const lessons = Array.isArray(plan.lessons) ? plan.lessons : [];
  entry.lessonsSeen += lessons.length;
  lessons.forEach((lesson) => {
    const lt = lesson.type;
    if (!entry.byType[lt]) entry.byType[lt] = { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 };
    entry.byType[lt].total += 1;
  });

  next[dateKey] = entry;
  return next;
};

// Roll up a newly completed lesson into the performance log for the given date
export const rollUpCompletedLessonToLog = (log: PerformanceLog, lesson: Lesson, date?: string | Date): PerformanceLog => {
  const dateKey = getDateKey(date);
  const next: PerformanceLog = { ...log };
  const entry: PerformanceLogEntry = next[dateKey] ? { ...next[dateKey], byType: { ...next[dateKey].byType } } : initPerformanceLogEntry();

  entry.lessonsCompleted += 1;
  // Add XP earned for this completed lesson
  entry.xpEarned += (lesson.xpReward || 0);

  const lt = lesson.type;
  if (!entry.byType[lt]) entry.byType[lt] = { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 };
  entry.byType[lt].completed += 1;

  // Build per-lesson review additions (dedup within the day)
  const vocabAdds: string[] = [];
  const pronAdds: string[] = [];

  // Contribute accuracy when available
  if (lesson.type === 'vocabulary') {
    const vs = lesson.sessionState as VocabularyState | undefined;
    const aiScores = vs?.aiScores;
    if (aiScores && aiScores.length > 0) {
      const lessonAccuracy = aiScores.reduce((sum: number, score: number) => sum + score, 0) / aiScores.length;
      entry.accuracyTotal += lessonAccuracy;
      entry.accuracyCount += 1;
      entry.byType[lt].accuracyTotal += lessonAccuracy;
      entry.byType[lt].accuracyCount += 1;
    }

    // Persist vocabulary review (failed + skipped words) and target sounds
    const failed = (vs?.failedWords || []).map((idx) => vs?.words?.[idx]?.word).filter(Boolean) as string[];
    const skipped = (vs?.skippedWords || []).map((idx) => vs?.words?.[idx]?.word).filter(Boolean) as string[];
    vocabAdds.push(...failed, ...skipped);
    const targetSounds = (vs?.words || [])
      .filter((_, idx) => (vs?.failedWords || []).includes(idx) || (vs?.skippedWords || []).includes(idx))
      .map((w) => w?.targetSound)
      .filter(Boolean) as string[];
    pronAdds.push(...targetSounds.map((ts) => `/${ts}/`));
  } else if (lesson.type === 'word_pairs' && Array.isArray(lesson.setBestScores) && lesson.setBestScores.length > 0) {
    const setBestScores = lesson.setBestScores as number[];
    const lessonAccuracy = setBestScores.reduce((sum: number, score: number) => sum + score, 0) / setBestScores.length;
    entry.accuracyTotal += lessonAccuracy;
    entry.accuracyCount += 1;
    entry.byType[lt].accuracyTotal += lessonAccuracy;
    entry.byType[lt].accuracyCount += 1;

    // Persist vocabulary review from incorrect matches, and pronunciation targets when available
    const wps = lesson.sessionState as WordPairsState | undefined;
    const errors = wps?.errorDetails?.incorrectMatches || [];
    errors.forEach((err) => {
      const lower = (err.correctTranslation || '').toLowerCase();
      if (lower) vocabAdds.push(lower);
      let targetSound: string | null = err.targetSound ?? null;
      if (!targetSound) {
        const inferred = inferSoundFromWord(lower, 'en');
        if (inferred?.targetSound && inferred.targetSound !== 'general') {
          targetSound = inferred.targetSound;
        }
      }
      if (targetSound) pronAdds.push(`/${targetSound}/`);
    });
  } else if (lesson.type === 'pronunciation') {
    // Persist baseline pronunciation targets until we have per-sound tracking in PronunciationState
    pronAdds.push('/θ/', '/ð/', '/r/', '/l/');
  }

  // Dedup and append to entry review arrays
  const vocabSet = new Set([...(entry.vocabularyReviewItems || []), ...vocabAdds]);
  const pronSet = new Set([...(entry.pronunciationReviewItems || []), ...pronAdds]);
  entry.vocabularyReviewItems = Array.from(vocabSet);
  entry.pronunciationReviewItems = Array.from(pronSet);

  next[dateKey] = entry;
  return next;
};

// Roll up streak freeze usage for a given date
export const rollUpFreezeUsageToLog = (log: PerformanceLog, freezesUsed: number, date?: string | Date): PerformanceLog => {
  if (!freezesUsed || freezesUsed <= 0) return log;
  const dateKey = getDateKey(date);
  const next: PerformanceLog = { ...log };
  const entry: PerformanceLogEntry = next[dateKey] ? { ...next[dateKey], byType: { ...next[dateKey].byType } } : initPerformanceLogEntry();
  entry.streakFreezesUsed = (entry.streakFreezesUsed || 0) + freezesUsed;
  next[dateKey] = entry;
  return next;
};

// Summarize a single day from the log
export const summarizeDailyFromLog = (log: PerformanceLog, date?: string | Date) => {
  const dateKey = getDateKey(date);
  const entry = log[dateKey];
  const totalLessonsDaily = entry?.lessonsSeen || 0;
  const completedLessonsDaily = entry?.lessonsCompleted || 0;
  const completionRateDaily = totalLessonsDaily > 0 ? Math.round((completedLessonsDaily / totalLessonsDaily) * 100) : 0;
  const averageAccuracyDaily = (entry?.accuracyCount || 0) > 0 ? Math.round((entry!.accuracyTotal / entry!.accuracyCount)) : 0;
  const xpEarnedDaily = entry?.xpEarned || 0;
  const freezesUsedDaily = entry?.streakFreezesUsed || 0;
  const vocabularyReviewDaily = Array.from(new Set(entry?.vocabularyReviewItems || []));
  const pronunciationReviewDaily = Array.from(new Set(entry?.pronunciationReviewItems || []));
  return { totalLessonsDaily, completedLessonsDaily, completionRateDaily, averageAccuracyDaily, xpEarnedDaily, freezesUsedDaily, vocabularyReviewDaily, pronunciationReviewDaily };
};

// Summarize lifetime from the log
export const summarizeLifetimeFromLog = (log: PerformanceLog) => {
  let lessonsSeen = 0;
  let lessonsCompleted = 0;
  let accuracyTotal = 0;
  let accuracyCount = 0;
  let xpEarnedLifetime = 0;
  let streakFreezesUsedLifetime = 0;
  const aggregateTypeStats: Record<LessonType, TypeStats> = blankTypeStats();
  const vocabLifetime = new Set<string>();
  const pronLifetime = new Set<string>();

  Object.values(log || {}).forEach((entry) => {
    lessonsSeen += entry.lessonsSeen;
    lessonsCompleted += entry.lessonsCompleted;
    accuracyTotal += entry.accuracyTotal;
    accuracyCount += entry.accuracyCount;
    xpEarnedLifetime += entry.xpEarned || 0;
    streakFreezesUsedLifetime += entry.streakFreezesUsed || 0;

    Object.entries(entry.byType || {}).forEach(([type, stats]) => {
      const lt = type as LessonType;
      if (!aggregateTypeStats[lt]) aggregateTypeStats[lt] = { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 };
      aggregateTypeStats[lt].total += stats.total;
      aggregateTypeStats[lt].completed += stats.completed;
      aggregateTypeStats[lt].accuracyTotal += stats.accuracyTotal;
      aggregateTypeStats[lt].accuracyCount += stats.accuracyCount;
    });

    // Aggregate review items lifetime
    (entry.vocabularyReviewItems || []).forEach((w) => w && vocabLifetime.add(w));
    (entry.pronunciationReviewItems || []).forEach((s) => s && pronLifetime.add(s));
  });

  const completionRate = lessonsSeen > 0 ? Math.round((lessonsCompleted / lessonsSeen) * 100) : 0;
  const averageAccuracy = accuracyCount > 0 ? Math.round(accuracyTotal / accuracyCount) : 0;

  const preferredLessonTypes = Object.entries(aggregateTypeStats)
    .filter(([_, s]) => {
      const rate = s.total > 0 ? (s.completed / s.total) : 0;
      const acc = s.accuracyCount > 0 ? Math.round(s.accuracyTotal / s.accuracyCount) : 0;
      return rate >= 0.7 || acc >= 70;
    })
    .map(([type]) => type as LessonType);

  const strugglingAreas = Object.entries(aggregateTypeStats)
    .filter(([_, s]) => {
      const rate = s.total > 0 ? (s.completed / s.total) : 0;
      const acc = s.accuracyCount > 0 ? Math.round(s.accuracyTotal / s.accuracyCount) : 0;
      return rate < 0.5 || (acc > 0 && acc < 60);
    })
    .map(([type]) => type as LessonType);

  return {
    completionRate,
    averageAccuracy,
    preferredLessonTypes,
    strugglingAreas,
    lessonsSeen,
    lessonsCompleted,
    xpEarnedLifetime,
    streakFreezesUsedLifetime,
    byType: aggregateTypeStats,
    vocabularyReviewLifetime: Array.from(vocabLifetime),
    pronunciationReviewLifetime: Array.from(pronLifetime),
  };
};