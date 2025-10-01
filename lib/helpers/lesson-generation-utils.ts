/**
 * Lesson generation and prioritization utility functions
 * Extracted from lesson-store.ts for better code organization
 */

import { VocabularyState, VocabularyWord } from '../types/vocabulary';
import { EnglishWord, TranslationWord, WordPair, WordPairsState } from '../types/word-pairs';
import { calculateLessonCount } from './date-streak-utils';
import { PerformanceMetrics, SpacedRepetitionData } from './performance-utils';

// Re-export types from lesson store to maintain consistency
export type { LessonType, Lesson, DailyPlan } from '../store/lesson-store';

// Intelligent mock plan generator with spaced repetition
export const generateIntelligentMockPlan = (
  onboardingData: any,
  performanceMetrics: PerformanceMetrics,
  spacedRepetitionData: SpacedRepetitionData,
  date: string
): import('../store/lesson-store').DailyPlan => {
  const lessonCount = calculateLessonCount(parseInt(onboardingData.timeCommitment));
  const lessons: import('../store/lesson-store').Lesson[] = [];

  // Prioritize lessons based on spaced repetition needs and performance
  const lessonPriorities = calculateLessonPriorities(
    performanceMetrics,
    spacedRepetitionData,
    onboardingData
  );

  // Generate lessons with intelligent prioritization
  for (let i = 0; i < lessonCount && i < lessonPriorities.length; i++) {
    const { type, priority, reason } = lessonPriorities[i];
    
    const lesson: import('../store/lesson-store').Lesson = {
      id: (i + 1).toString(),
      type: type as import('../store/lesson-store').LessonType,
      title: generateLessonTitle(type, onboardingData.learningGoal, spacedRepetitionData, reason),
      description: generateLessonDescription(type, onboardingData.languageLevel, reason),
      xpReward: calculateXpReward(type, onboardingData.languageLevel, priority),
      completed: false,
      locked: false,
    };

    // Add lesson-specific properties
    if (type === 'word_pairs') {
      const wordPairLesson = lesson as any;
      wordPairLesson.totalSets = 3;
      wordPairLesson.completedSets = 0;
      wordPairLesson.setBestScores = Array(3).fill(0);
    }

    lessons.push(lesson);
  }

  return {
    id: `mock-${Date.now()}`,
    date: new Date(date).toISOString(),
    lessons,
    totalXp: lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0),
    completedLessons: 0,
  };
};

// Calculate lesson priorities based on spaced repetition and performance
export const calculateLessonPriorities = (
  performanceMetrics: PerformanceMetrics,
  spacedRepetitionData: SpacedRepetitionData,
  onboardingData: any
) => {
  const allLessonTypes = ['vocabulary', 'listening', 'pronunciation', 'roleplay', 'shadowing', 'voice_journaling', 'word_pairs'];
  const priorities: Array<{ type: string; priority: number; reason: string }> = [];

  allLessonTypes.forEach(type => {
    let priority = 50; // Base priority
    let reason = 'regular_practice';

    // High priority for spaced repetition needs
    if (type === 'vocabulary' && spacedRepetitionData.vocabularyReview.length > 0) {
      priority += 40;
      reason = 'vocabulary_review';
    }
    if (type === 'pronunciation' && spacedRepetitionData.pronunciationReview.length > 0) {
      priority += 40;
      reason = 'pronunciation_review';
    }

    // High priority for struggling areas
    if (performanceMetrics.strugglingAreas.includes(type)) {
      priority += 30;
      reason = reason === 'regular_practice' ? 'struggling_area' : `${reason}_struggling`;
    }

    // Bonus for preferred lesson types (user performs well)
    if (performanceMetrics.preferredLessonTypes.includes(type)) {
      priority += 10;
    }

    // Adjust based on difficulty preference
    if (spacedRepetitionData.difficultyAdjustment === 'increase') {
      if (['pronunciation', 'roleplay', 'shadowing'].includes(type)) {
        priority += 15;
      }
    } else if (spacedRepetitionData.difficultyAdjustment === 'decrease') {
      if (['vocabulary', 'listening', 'word_pairs'].includes(type)) {
        priority += 15;
      }
    }

    // Learning style preferences
    const learningStyle = onboardingData.learningStyle;
    if (learningStyle === 'visual' && ['vocabulary', 'word_pairs'].includes(type)) {
      priority += 10;
    } else if (learningStyle === 'auditory' && ['listening', 'pronunciation', 'shadowing'].includes(type)) {
      priority += 10;
    } else if (learningStyle === 'kinesthetic' && ['roleplay', 'voice_journaling'].includes(type)) {
      priority += 10;
    }

    priorities.push({ type, priority, reason });
  });

  // Sort by priority (highest first) and return
  return priorities.sort((a, b) => b.priority - a.priority);
};

// Helper functions for lesson generation
export const generateLessonTitle = (type: string, learningGoal: string, spacedRepetition: SpacedRepetitionData, reason?: string): string => {
  // Customize titles based on the reason for prioritization
  if (reason === 'vocabulary_review') {
    return `Review: ${spacedRepetition.vocabularyReview.slice(0, 2).join(', ')} & More`;
  }
  if (reason === 'pronunciation_review') {
    return `Pronunciation Review: ${spacedRepetition.pronunciationReview[0] || 'Common Sounds'}`;
  }
  if (reason?.includes('struggling')) {
    return `Focus Practice: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }

  const titles = {
    vocabulary: `${learningGoal.charAt(0).toUpperCase() + learningGoal.slice(1)} Vocabulary`,
    listening: 'Active Listening Practice',
    pronunciation: `Pronunciation Focus: ${spacedRepetition.pronunciationReview[0] || 'Common Sounds'}`,
    roleplay: `${learningGoal.charAt(0).toUpperCase() + learningGoal.slice(1)} Conversation`,
    shadowing: 'Native Speech Patterns',
    voice_journaling: 'Voice Reflection',
    word_pairs: `${learningGoal.charAt(0).toUpperCase() + learningGoal.slice(1)} Word Matching`
  };
  return titles[type as keyof typeof titles] || 'Practice Session';
};

export const generateLessonDescription = (type: string, languageLevel: string, reason?: string): string => {
  const difficulty = languageLevel === 'beginner' ? 'basic' : 
                    languageLevel === 'advanced' ? 'advanced' : 'intermediate';
  
  // Customize descriptions based on the reason for prioritization
  if (reason === 'vocabulary_review') {
    return `Review previously learned vocabulary to strengthen retention`;
  }
  if (reason === 'pronunciation_review') {
    return `Practice pronunciation patterns that need reinforcement`;
  }
  if (reason === 'struggling_area') {
    return `Focused practice to improve performance in this area`;
  }
  if (reason?.includes('struggling')) {
    return `Combined review and practice for challenging content`;
  }
  
  const descriptions = {
    vocabulary: `Learn ${difficulty} vocabulary words and their usage`,
    listening: `Improve comprehension with ${difficulty} audio content`,
    pronunciation: `Practice ${difficulty} pronunciation patterns`,
    roleplay: `Engage in ${difficulty} conversational scenarios`,
    shadowing: `Mirror native speaker patterns at ${difficulty} level`,
    voice_journaling: `Record thoughts using ${difficulty} vocabulary`,
    word_pairs: `Match related vocabulary at ${difficulty} level`
  };
  return descriptions[type as keyof typeof descriptions] || 'Practice session';
};

export const calculateXpReward = (type: string, languageLevel: string, priority?: number): number => {
  const baseXp = {
    vocabulary: 100,
    listening: 150,
    pronunciation: 120,
    roleplay: 200,
    shadowing: 180,
    voice_journaling: 160,
    word_pairs: 0 // Calculated from setBestScores
  };
  
  const levelMultiplier = languageLevel === 'beginner' ? 0.8 : 
                         languageLevel === 'advanced' ? 1.2 : 1.0;
  
  // Priority-based XP bonus (higher priority = more XP)
  const priorityMultiplier = priority ? Math.min(1.5, 1 + (priority - 50) / 100) : 1.0;
  
  return Math.round((baseXp[type as keyof typeof baseXp] || 100) * levelMultiplier * priorityMultiplier);
};