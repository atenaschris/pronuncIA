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
  completionRate: number;
  averageAccuracy: number;
  preferredLessonTypes: LessonType[];
  strugglingAreas: LessonType[];
}

export const calculateUserPerformanceMetrics = (state: { dailyPlan: DailyPlan | null }): PerformanceMetrics => {
  const { dailyPlan } = state;
  
  if (!dailyPlan || !dailyPlan.lessons.length) {
    return {
      completionRate: 0,
      averageAccuracy: 0,
      preferredLessonTypes: [],
      strugglingAreas: []
    };
  }

  // Calculate completion rate from current daily plan
  const totalLessons = dailyPlan.lessons.length;
  const completedLessons = dailyPlan.lessons.filter((lesson: Lesson) => lesson.completed).length;
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate average accuracy from vocabulary lessons with AI scores
  let totalAccuracy = 0;
  let accuracyCount = 0;
  const lessonTypePerformance: Record<LessonType, { completed: number; total: number; avgAccuracy: number }> = {} as any;

  dailyPlan.lessons.forEach((lesson: Lesson) => {
    const lessonType = lesson.type;
    
    if (!lessonTypePerformance[lessonType]) {
      lessonTypePerformance[lessonType] = { completed: 0, total: 0, avgAccuracy: 0 };
    }
    
    lessonTypePerformance[lessonType].total++;
    
    if (lesson.completed) {
      lessonTypePerformance[lessonType].completed++;
      
      // Calculate accuracy for vocabulary lessons
      if (lesson.type === 'vocabulary') {
        const vs = lesson.sessionState as VocabularyState | undefined;
        const aiScores = vs?.aiScores;
        if (aiScores && aiScores.length > 0) {
          const lessonAccuracy = aiScores.reduce((sum: number, score: number) => sum + score, 0) / aiScores.length;
          totalAccuracy += lessonAccuracy;
          accuracyCount++;
          lessonTypePerformance[lessonType].avgAccuracy = lessonAccuracy;
        }
      }
      
      // Calculate accuracy for word pairs lessons
      if (lesson.type === 'word_pairs' && Array.isArray(lesson.setBestScores) && lesson.setBestScores.length > 0) {
        const setBestScores = lesson.setBestScores as number[];
        const lessonAccuracy = setBestScores.reduce((sum: number, score: number) => sum + score, 0) / setBestScores.length;
        totalAccuracy += lessonAccuracy;
        accuracyCount++;
        lessonTypePerformance[lessonType].avgAccuracy = lessonAccuracy;
      }
    }
  });

  const averageAccuracy = accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0;

  // Identify preferred lesson types (high completion rate)
  const preferredLessonTypes = Object.entries(lessonTypePerformance)
    .filter(([_, performance]) => performance.total > 0 && (performance.completed / performance.total) >= 0.7)
    .map(([type, _]) => type as LessonType);

  // Identify struggling areas (low completion rate or low accuracy)
  const strugglingAreas = Object.entries(lessonTypePerformance)
    .filter(([_, performance]) => {
      const completionRate = performance.total > 0 ? performance.completed / performance.total : 0;
      // Use app-wide accuracy threshold to identify struggles
      const ACCURACY_FLOOR = 60; // fallback floor if avgAccuracy is reported on different scale
      return completionRate < 0.5 || (performance.avgAccuracy > 0 && performance.avgAccuracy < ACCURACY_FLOOR);
    })
    .map(([type, _]) => type as LessonType);

  return {
    completionRate,
    averageAccuracy,
    preferredLessonTypes,
    strugglingAreas
  };
};

// Spaced repetition data calculation
export interface SpacedRepetitionData {
  vocabularyReview: string[];
  pronunciationReview: string[];
  difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
}

export const calculateSpacedRepetitionNeeds = (state: { dailyPlan: DailyPlan | null }): SpacedRepetitionData => {
  const { dailyPlan } = state;
  
  if (!dailyPlan || !dailyPlan.lessons.length) {
    return {
      vocabularyReview: [],
      pronunciationReview: [],
      difficultyAdjustment: 'maintain'
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

  // Determine difficulty adjustment based on overall performance
  let difficultyAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';
  
  if (accuracyCount > 0) {
    const averageAccuracy = totalAccuracy / accuracyCount;
    const INCREASE_THRESHOLD = 85;
    const DECREASE_THRESHOLD = 60;
    if (averageAccuracy >= INCREASE_THRESHOLD) {
      difficultyAdjustment = 'increase';
    } else if (averageAccuracy < DECREASE_THRESHOLD) {
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