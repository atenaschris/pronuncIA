import { 
  LANGUAGE_LEVELS, 
  LEARNING_GOALS, 
  LEARNING_STYLES, 
  NATIVE_LANGUAGES, 
  TARGET_LANGUAGES 
} from '../constants/constants';
import { 
  LanguageLevel, 
  LearningGoal, 
  LearningStyle, 
  NativeLanguageCode, 
  TargetLanguageCode 
} from '../types/onboarding-types';

/**
 * Utility functions that leverage existing constants and TypeScript types
 * for consistent data access across the application
 */

export const getTargetLanguageInfo = (languageId: TargetLanguageCode) => {
  return TARGET_LANGUAGES.find(lang => lang.id === languageId);
};

export const getNativeLanguageInfo = (languageId: NativeLanguageCode) => {
  return NATIVE_LANGUAGES.find(lang => lang.id === languageId);
};

export const getLanguageLevelInfo = (levelId: LanguageLevel) => {
  return LANGUAGE_LEVELS.find(level => level.id === levelId);
};

export const getLearningGoalInfo = (goalId: LearningGoal) => {
  return LEARNING_GOALS.find(goal => goal.id === goalId);
};

export const getLearningStyleInfo = (styleId: LearningStyle) => {
  return LEARNING_STYLES.find(style => style.id === styleId);
};

/**
 * Enhanced description functions that provide AI-friendly context
 * These combine the existing descriptions with additional learning context
 */

export const getTargetLanguageDescription = (languageId: TargetLanguageCode): string => {
  const info = getTargetLanguageInfo(languageId);
  return info?.description || `${languageId} pronunciation and speaking skills`;
};

export const getNativeLanguageDescription = (languageId: NativeLanguageCode): string => {
  const info = getNativeLanguageInfo(languageId);
  if (!info) return 'General pronunciation focus';
  
  // Enhanced descriptions with pronunciation challenges for AI context
  const challenges: Record<NativeLanguageCode, string> = {
    'en': 'English baseline – tailor focus to target language pronunciation',
    'es': 'Focus on English sounds not present in Spanish (th, v/b distinction)',
    'fr': 'Work on English rhythm and stress patterns, silent letters',
    'de': 'Practice English word order and th/w sounds',
    'it': 'Emphasize English consonant clusters and vowel distinctions',
    'pt': 'Focus on English vowel distinctions and final consonants',
    'zh': 'Practice English tones, rhythm, and L/R distinction',
    'ja': 'Work on English L/R distinction and stress patterns',
    'ko': 'Focus on English consonant endings and vowel system',
    'ar': 'Practice English vowel system and consonant clusters',
    'ru': 'Work on English articles, prepositions, and soft sounds'
  };
  
  return challenges[languageId] || info.description;
};

export const getLanguageLevelDescription = (levelId: LanguageLevel): string => {
  const info = getLanguageLevelInfo(levelId);
  if (!info) return levelId;
  
  // Enhanced descriptions for AI context
  const enhancedDescriptions: Record<LanguageLevel, string> = {
    'A1': 'Basic vocabulary and simple phrases - focus on fundamental sounds',
    'A2': 'Simple conversations and basic grammar - work on common patterns',
    'B1': 'Complex conversations and advanced grammar - refine pronunciation accuracy',
    'B2': 'Fluent conversations with occasional errors - polish advanced sounds',
    'C1': 'Near-native proficiency with nuanced understanding - perfect subtle distinctions',
    'C2': 'Native-level mastery - maintain and enhance natural flow'
  };
  
  return enhancedDescriptions[levelId] || info.description;
};

export const getLearningGoalDescription = (goalId: LearningGoal): string => {
  const info = getLearningGoalInfo(goalId);
  if (!info) return goalId;
  
  // Enhanced descriptions for AI context
  const contexts: Record<LearningGoal, string> = {
    'travel': 'Practical phrases for travel and tourism - focus on clear communication',
    'fluency': 'Well-rounded skills for daily life - balanced pronunciation development',
    'work': 'Professional communication and business vocabulary - formal pronunciation',
    'exam': 'Academic vocabulary and test-specific pronunciation patterns'
  };
  
  return contexts[goalId] || info.description;
};

export const getLearningStyleDescription = (styleId: LearningStyle): string => {
  const info = getLearningStyleInfo(styleId);
  if (!info) return styleId;
  
  // Enhanced descriptions for AI context
  const approaches: Record<LearningStyle, string> = {
    'visual': 'Text-based exercises with visual cues and phonetic transcriptions',
    'audio': 'Listening-focused activities with audio feedback and repetition',
    'conversational': 'Interactive exercises, role-play, and dialogue practice'
  };
  
  return approaches[styleId] || info.description;
};

/**
 * Formatted strings for AI prompts that combine label and description
 */

export const formatTargetLanguageForAI = (languageId: TargetLanguageCode): string => {
  const info = getTargetLanguageInfo(languageId);
  const description = getTargetLanguageDescription(languageId);
  return `${info?.label || languageId} (${description})`;
};

export const formatNativeLanguageForAI = (languageId: NativeLanguageCode): string => {
  const info = getNativeLanguageInfo(languageId);
  const description = getNativeLanguageDescription(languageId);
  return `${info?.label || languageId} (${description})`;
};

export const formatLanguageLevelForAI = (levelId: LanguageLevel): string => {
  const info = getLanguageLevelInfo(levelId);
  const description = getLanguageLevelDescription(levelId);
  return `${info?.label || levelId} (${description})`;
};

export const formatLearningGoalForAI = (goalId: LearningGoal): string => {
  const info = getLearningGoalInfo(goalId);
  const description = getLearningGoalDescription(goalId);
  return `${info?.label || goalId} (${description})`;
};

export const formatLearningStyleForAI = (styleId: LearningStyle): string => {
  const info = getLearningStyleInfo(styleId);
  const description = getLearningStyleDescription(styleId);
  return `${info?.label || styleId} (${description})`;
};