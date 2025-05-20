import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

import { LANGUAGE_LEVELS, LEARNING_GOALS, LEARNING_STYLES, NATIVE_LANGUAGES, TIME_OPTIONS } from '@/constants/constants';

export type NativeLanguageCode = typeof NATIVE_LANGUAGES[number]['id'];
export type LanguageLevel = typeof LANGUAGE_LEVELS[number]['id'];
export type LearningGoal = typeof LEARNING_GOALS[number]['id'];
export type LearningStyle = typeof LEARNING_STYLES[number]['id'];
export type TimeCommitment = typeof TIME_OPTIONS[number]['id'];

interface OnboardingState {
  currentStep: number;
  languageLevel: LanguageLevel;
  nativeLanguage: NativeLanguageCode;
  learningGoal: LearningGoal;
  timeCommitment: TimeCommitment;
  learningStyle: LearningStyle;
  isComplete: boolean;

  setCurrentStep: (step: number) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setNativeLanguage: (language: NativeLanguageCode) => void;
  setLearningGoal: (goal: LearningGoal) => void;
  setTimeCommitment: (minutes: TimeCommitment) => void;
  setLearningStyle: (style: LearningStyle) => void;
  setIsComplete: (isComplete: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(persist(
  (set) => ({
    currentStep: 0,
    languageLevel: LANGUAGE_LEVELS[0].id,
    nativeLanguage: NATIVE_LANGUAGES[0].id,
    learningGoal: LEARNING_GOALS[0].id,
    timeCommitment: TIME_OPTIONS[0].id, // TODO: CHANGE THIS TO DEFAULT VALU,
    learningStyle: LEARNING_STYLES[0].id,
    isComplete: false,

    setCurrentStep: (step) => set({ currentStep: step }),
    setLanguageLevel: (level) => set({ languageLevel: level }),
    setNativeLanguage: (language) => set({ nativeLanguage: language }),
    setLearningGoal: (goal) => set({ learningGoal: goal }),
    setTimeCommitment: (minutes) => set({ timeCommitment: minutes }),
    setLearningStyle: (style) => set({ learningStyle: style }),
    setIsComplete: (isComplete) => set({ isComplete }),
    resetOnboarding: () => set({
      currentStep: 0,
      languageLevel: LANGUAGE_LEVELS[0].id,
      nativeLanguage: NATIVE_LANGUAGES[0].id,
      learningGoal: LEARNING_GOALS[0].id,
      timeCommitment: "15",
      learningStyle: LEARNING_STYLES[0].id,
      isComplete: false,
    }),
  }),
  {
    name: 'onboarding-storage',
    storage: createJSONStorage(() => ({
      getItem: async (name: string) => {
        return await SecureStore.getItemAsync(name);
      },
      setItem: async (name: string, value: string) => {
        await SecureStore.setItemAsync(name, value);
      },
      removeItem: async (name: string) => {
        await SecureStore.deleteItemAsync(name);
      },
    } as StateStorage)),
  }
));