/**
 * Performance metrics and spaced repetition utility functions
 * Extracted from lesson-store.ts for better code organization
 */

import { VOCABULARY_WORD_SETS } from '../constants/constants';
import type { DailyPlan, Lesson, LessonType } from '../store/lesson-store';
import type { VocabularyState } from '../types/vocabulary';
import type { WordPairsState } from '../types/word-pairs';

// Performance metrics calculation
export interface PerformanceMetrics {
  // Lifetime (cumulative across all activity)
  completionRate: number; // lifetime completion rate
  averageAccuracy: number; // lifetime average accuracy
  preferredLessonTypes: LessonType[];
  strugglingAreas: LessonType[];
  totalLessonsLifetime: number;
  completedLessonsLifetime: number;

  // Daily (based on current daily plan)
  totalLessonsDaily: number;
  completedLessonsDaily: number;
  completionRateDaily: number;
  averageAccuracyDaily: number;
}

export const calculateUserPerformanceMetrics = (state: {
  dailyPlan: DailyPlan | null;
  lifetimeLessonsSeen: number;
  lifetimeLessonsCompleted: number;
  lifetimeAccuracyTotal: number;
  lifetimeAccuracyCount: number;
}): PerformanceMetrics => {
  const { dailyPlan } = state;

  // --------------------------------------
  // Daily metrics from the current daily plan
  // --------------------------------------
  let totalLessonsDaily = 0;
  let completedLessonsDaily = 0;
  let dailyAccuracyTotal = 0;
  let dailyAccuracyCount = 0;

  const lessonTypePerformance: Record<LessonType, { completed: number; total: number; avgAccuracy: number }> = {} as Record<LessonType, { completed: number; total: number; avgAccuracy: number }>;

  if (dailyPlan && dailyPlan.lessons.length) {
    totalLessonsDaily = dailyPlan.lessons.length;
    completedLessonsDaily = dailyPlan.lessons.filter((lesson: Lesson) => lesson.completed).length;

    dailyPlan.lessons.forEach((lesson: Lesson) => {
      const lessonType = lesson.type;
      if (!lessonTypePerformance[lessonType]) {
        lessonTypePerformance[lessonType] = { completed: 0, total: 0, avgAccuracy: 0 };
      }
      lessonTypePerformance[lessonType].total++;

      if (lesson.completed) {
        lessonTypePerformance[lessonType].completed++;

        // Vocabulary accuracy contribution (per-lesson average of aiScores)
        if (lesson.type === 'vocabulary') {
          const vs = lesson.sessionState as VocabularyState | undefined;
          const aiScores = vs?.aiScores;
          if (aiScores && aiScores.length > 0) {
            const lessonAccuracy = aiScores.reduce((sum: number, score: number) => sum + score, 0) / aiScores.length;
            dailyAccuracyTotal += lessonAccuracy;
            dailyAccuracyCount++;
            lessonTypePerformance[lessonType].avgAccuracy = lessonAccuracy;
          }
        }

        // Word-pairs accuracy contribution (per-lesson average of setBestScores)
        if (lesson.type === 'word_pairs' && Array.isArray(lesson.setBestScores) && lesson.setBestScores.length > 0) {
          const setBestScores = lesson.setBestScores as number[];
          const lessonAccuracy = setBestScores.reduce((sum: number, score: number) => sum + score, 0) / setBestScores.length;
          dailyAccuracyTotal += lessonAccuracy;
          dailyAccuracyCount++;
          lessonTypePerformance[lessonType].avgAccuracy = lessonAccuracy;
        }
      }
    });
  }

  const completionRateDaily = totalLessonsDaily > 0 ? Math.round((completedLessonsDaily / totalLessonsDaily) * 100) : 0;
  const averageAccuracyDaily = dailyAccuracyCount > 0 ? Math.round(dailyAccuracyTotal / dailyAccuracyCount) : 0;

  // Identify preferred lesson types (high completion rate) from daily performance snapshot
  const preferredLessonTypes = Object.entries(lessonTypePerformance)
    .filter(([_, performance]) => performance.total > 0 && (performance.completed / performance.total) >= 0.7)
    .map(([type]) => type as LessonType);

  // Identify struggling areas (low completion rate or low accuracy) from daily performance snapshot
  const strugglingAreas = Object.entries(lessonTypePerformance)
    .filter(([_, performance]) => {
      const compRate = performance.total > 0 ? performance.completed / performance.total : 0;
      const ACCURACY_FLOOR = 60;
      const hasActivity = performance.completed > 0 || performance.avgAccuracy > 0;
      if (!hasActivity) return false;
      return compRate < 0.5 || (performance.avgAccuracy > 0 && performance.avgAccuracy < ACCURACY_FLOOR);
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

    // Daily breakdown for richer downstream use
    totalLessonsDaily,
    completedLessonsDaily,
    completionRateDaily,
    averageAccuracyDaily,
  };
};

// Spaced repetition data calculation
export interface SpacedRepetitionData {
  vocabularyReview: string[];
  pronunciationReview: string[];
  difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
}

// Make difficulty selection lifetime-aware while keeping review lists daily-scoped
export const calculateSpacedRepetitionNeeds = (state: {
  dailyPlan: DailyPlan | null;
  lifetimeAccuracyTotal?: number;
  lifetimeAccuracyCount?: number;
  lifetimeLessonsSeen?: number;
  lifetimeLessonsCompleted?: number;
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

    return {
      vocabularyReview: [],
      pronunciationReview: [],
      difficultyAdjustment,
    };
  }

  const vocabularyReview: string[] = [];
  const pronunciationReview: string[] = [];
  let totalAccuracy = 0;
  let accuracyCount = 0;

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
        
        // Calculate accuracy for difficulty adjustment
        if (vocabState.aiScores?.length > 0) {
          const lessonAccuracy = vocabState.aiScores.reduce((sum: number, score: number) => sum + score, 0) / vocabState.aiScores.length;
          totalAccuracy += lessonAccuracy;
          accuracyCount++;

          // Add low-scoring sounds to pronunciation review
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
            vocabularyReview.push(error.correctTranslation);

            // Also derive a pronunciation target if this word exists in our vocabulary sets.
            const lower = error.correctTranslation.toLowerCase();
            const matchingEntry = Object.values(VOCABULARY_WORD_SETS)
              .flat()
              .find((v) => v.word.toLowerCase() === lower);
            if (matchingEntry?.targetSound) {
              pronunciationReview.push(`/${matchingEntry.targetSound}/`);
            }
          });
        }

        // Contribute word-pairs accuracy to difficulty adjustment
        if (Array.isArray(lesson.setBestScores) && lesson.setBestScores.length > 0) {
          const setBestScores = lesson.setBestScores as number[];
          const wpAccuracy = setBestScores.reduce((sum: number, score: number) => sum + score, 0) / setBestScores.length;
          totalAccuracy += wpAccuracy;
          accuracyCount++;
        }
      }
    }
  });

  // Determine difficulty adjustment blending daily snapshot with lifetime accuracy
  let difficultyAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';

  const dailyAvgAccuracy = accuracyCount > 0 ? (totalAccuracy / accuracyCount) : null;
  const combinedAccuracy =
    dailyAvgAccuracy !== null && lifetimeAvgAccuracy !== null
      ? (dailyAvgAccuracy * 0.7) + (lifetimeAvgAccuracy * 0.3)
      : (dailyAvgAccuracy ?? lifetimeAvgAccuracy);

  if (typeof combinedAccuracy === 'number') {
    if (combinedAccuracy >= INCREASE_THRESHOLD) {
      difficultyAdjustment = 'increase';
    } else if (combinedAccuracy < DECREASE_THRESHOLD) {
      difficultyAdjustment = 'decrease';
    }
  }

  // Remove duplicates from review lists
  const uniqueVocabularyReview = [...new Set(vocabularyReview)];
  const uniquePronunciationReview = [...new Set(pronunciationReview)];

  return {
    vocabularyReview: uniqueVocabularyReview,
    pronunciationReview: uniquePronunciationReview,
    difficultyAdjustment
  };
};