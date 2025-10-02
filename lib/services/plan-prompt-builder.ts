import { calculateLessonCount } from '../helpers/date-streak-utils';
import {
  formatLanguageLevelForAI,
  formatLearningGoalForAI,
  formatLearningStyleForAI,
  formatNativeLanguageForAI,
  formatTargetLanguageForAI,
} from '../helpers/onboarding-utils';
import type { PerformanceMetrics, SpacedRepetitionData } from '../helpers/performance-utils';
import type {
  LanguageLevel,
  LearningGoal,
  LearningStyle,
  NativeLanguageCode,
  TargetLanguageCode,
} from '../types/onboarding-types';

export interface DailyPlanPromptInput {
  targetLanguage: TargetLanguageCode;
  languageLevel: LanguageLevel;
  nativeLanguage: NativeLanguageCode;
  learningGoal: LearningGoal;
  timeCommitment: string;
  learningStyle: LearningStyle;
  currentStreak: number;
  totalXp: number;
  lastActivityDate: string | null;
  performanceMetrics: PerformanceMetrics;
  spacedRepetitionData: SpacedRepetitionData;
}

export const buildDailyPlanPrompt = (input: DailyPlanPromptInput): string => {
  const {
    targetLanguage,
    languageLevel,
    nativeLanguage,
    learningGoal,
    timeCommitment,
    learningStyle,
    currentStreak,
    totalXp,
    lastActivityDate,
    performanceMetrics,
    spacedRepetitionData,
  } = input;

  return `Generate a personalized daily lesson plan for a user with the following comprehensive profile:

ONBOARDING DATA:
- Target Language: ${formatTargetLanguageForAI(targetLanguage)}
- Language Level: ${formatLanguageLevelForAI(languageLevel)}
- Native Language: ${formatNativeLanguageForAI(nativeLanguage)}
- Learning Goal: ${formatLearningGoalForAI(learningGoal)}
- Time Commitment: ${timeCommitment} minutes per day
- Learning Style: ${formatLearningStyleForAI(learningStyle)}

PERFORMANCE METRICS:
- Current Streak: ${currentStreak} days
- Total XP: ${totalXp}
- Last Activity: ${lastActivityDate || 'Never'}
- Average Lesson Completion Rate: ${performanceMetrics.completionRate}%
- Average Accuracy: ${performanceMetrics.averageAccuracy}%
- Preferred Lesson Types: ${performanceMetrics.preferredLessonTypes.join(', ')}
- Struggling Areas: ${performanceMetrics.strugglingAreas.join(', ')}

SPACED REPETITION NEEDS:
- Vocabulary Words to Review: ${spacedRepetitionData.vocabularyReview.length}
- Pronunciation Sounds to Practice: ${spacedRepetitionData.pronunciationReview.join(', ')}
- Difficulty Adjustment: ${spacedRepetitionData.difficultyAdjustment}

REQUIREMENTS:
1. Create ${calculateLessonCount(parseInt(timeCommitment))} lessons based on time commitment
2. Prioritize ${learningGoal} related content
3. Adapt difficulty to ${languageLevel} level
4. Include spaced repetition for struggling areas
5. Match ${learningStyle} preferences
6. Consider native language ${nativeLanguage} specific challenges

The plan should include a variety of lesson types: vocabulary, listening, pronunciation, roleplay, shadowing, voice journaling, and word pairs.
Each lesson should have an id, type, title, description, xpReward, completed (false), and locked (false).
Return a JSON object matching the DailyPlan interface.`;
};