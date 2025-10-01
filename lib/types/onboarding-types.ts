import { LANGUAGE_LEVELS, LEARNING_GOALS, LEARNING_STYLES, NATIVE_LANGUAGES, TARGET_LANGUAGES, TIME_OPTIONS } from "../constants/constants";

export type NativeLanguageCode = typeof NATIVE_LANGUAGES[number]['id'];
export type TargetLanguageCode = typeof TARGET_LANGUAGES[number]['id'];
export type LanguageLevel = typeof LANGUAGE_LEVELS[number]['id'];
export type LearningGoal = typeof LEARNING_GOALS[number]['id'];
export type LearningStyle = typeof LEARNING_STYLES[number]['id'];
export type TimeCommitment = typeof TIME_OPTIONS[number]['id'];

export interface OnboardingState {
  currentStep: number;
  languageLevel: LanguageLevel;
  nativeLanguage: NativeLanguageCode;
  targetLanguage: TargetLanguageCode;
  learningGoal: LearningGoal;
  timeCommitment: TimeCommitment;
  learningStyle: LearningStyle;
  isComplete: boolean;

  setCurrentStep: (step: number) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setNativeLanguage: (language: NativeLanguageCode) => void;
  setTargetLanguage: (language: TargetLanguageCode) => void;
  setLearningGoal: (goal: LearningGoal) => void;
  setTimeCommitment: (minutes: TimeCommitment) => void;
  setLearningStyle: (style: LearningStyle) => void;
  setIsComplete: (isComplete: boolean) => void;
  resetOnboarding: () => void;
}