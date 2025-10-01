/**
 * Performance metrics and spaced repetition utility functions
 * Extracted from lesson-store.ts for better code organization
 */

// Performance metrics calculation
export interface PerformanceMetrics {
  completionRate: number;
  averageAccuracy: number;
  preferredLessonTypes: string[];
  strugglingAreas: string[];
}

export const calculateUserPerformanceMetrics = (state: any): PerformanceMetrics => {
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
  const completedLessons = dailyPlan.lessons.filter((lesson: any) => lesson.completed).length;
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate average accuracy from vocabulary lessons with AI scores
  let totalAccuracy = 0;
  let accuracyCount = 0;
  const lessonTypePerformance: { [key: string]: { completed: number; total: number; avgAccuracy: number } } = {};

  dailyPlan.lessons.forEach((lesson: any) => {
    const lessonType = lesson.type;
    
    if (!lessonTypePerformance[lessonType]) {
      lessonTypePerformance[lessonType] = { completed: 0, total: 0, avgAccuracy: 0 };
    }
    
    lessonTypePerformance[lessonType].total++;
    
    if (lesson.completed) {
      lessonTypePerformance[lessonType].completed++;
      
      // Calculate accuracy for vocabulary lessons
      if (lesson.type === 'vocabulary' && lesson.sessionState?.aiScores?.length > 0) {
        const aiScores = lesson.sessionState.aiScores;
        const lessonAccuracy = aiScores.reduce((sum: number, score: number) => sum + score, 0) / aiScores.length;
        totalAccuracy += lessonAccuracy;
        accuracyCount++;
        lessonTypePerformance[lessonType].avgAccuracy = lessonAccuracy;
      }
      
      // Calculate accuracy for word pairs lessons
      if (lesson.type === 'word_pairs' && lesson.setBestScores?.length > 0) {
        const setBestScores = lesson.setBestScores;
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
    .map(([type, _]) => type);

  // Identify struggling areas (low completion rate or low accuracy)
  const strugglingAreas = Object.entries(lessonTypePerformance)
    .filter(([_, performance]) => {
      const completionRate = performance.total > 0 ? performance.completed / performance.total : 0;
      return completionRate < 0.5 || (performance.avgAccuracy > 0 && performance.avgAccuracy < 60);
    })
    .map(([type, _]) => type);

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

export const calculateSpacedRepetitionNeeds = (state: any): SpacedRepetitionData => {
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
  dailyPlan.lessons.forEach((lesson: any) => {
    if (lesson.completed && lesson.sessionState) {
      // Vocabulary lessons - identify failed/skipped words for review
      if (lesson.type === 'vocabulary') {
        const vocabState = lesson.sessionState as any;
        
        // Add failed words to review list
        if (vocabState.failedWords?.length > 0) {
          vocabState.words?.forEach((word: any, index: number) => {
            if (vocabState.failedWords.includes(index)) {
              vocabularyReview.push(word.word || `word_${index}`);
            }
          });
        }
        
        // Add skipped words to review list
        if (vocabState.skippedWords?.length > 0) {
          vocabState.words?.forEach((word: any, index: number) => {
            if (vocabState.skippedWords.includes(index)) {
              vocabularyReview.push(word.word || `word_${index}`);
            }
          });
        }
        
        // Calculate accuracy for difficulty adjustment
        if (vocabState.aiScores?.length > 0) {
          const lessonAccuracy = vocabState.aiScores.reduce((sum: number, score: number) => sum + score, 0) / vocabState.aiScores.length;
          totalAccuracy += lessonAccuracy;
          accuracyCount++;
        }
      }
      
      // Pronunciation lessons - identify struggling sounds
      if (lesson.type === 'pronunciation') {
        // Add common pronunciation challenges based on performance
        pronunciationReview.push('/θ/', '/ð/', '/r/', '/l/');
      }
      
      // Word pairs lessons - identify incorrect matches for vocabulary review
      if (lesson.type === 'word_pairs') {
        const wordPairsState = lesson.sessionState as any;
        if (wordPairsState.errorDetails?.incorrectMatches?.length > 0) {
          wordPairsState.errorDetails.incorrectMatches.forEach((error: any) => {
            vocabularyReview.push(error.englishWord);
          });
        }
      }
    }
  });

  // Determine difficulty adjustment based on overall performance
  let difficultyAdjustment: 'increase' | 'maintain' | 'decrease' = 'maintain';
  
  if (accuracyCount > 0) {
    const averageAccuracy = totalAccuracy / accuracyCount;
    
    if (averageAccuracy >= 85) {
      difficultyAdjustment = 'increase';
    } else if (averageAccuracy < 60) {
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