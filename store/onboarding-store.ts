import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

import { LANGUAGE_LEVELS, LEARNING_GOALS, LEARNING_STYLES, NATIVE_LANGUAGES } from '@/constants/constants';

export type NativeLanguageCode = typeof NATIVE_LANGUAGES[number]['id'];
export type LanguageLevel = typeof LANGUAGE_LEVELS[number]['id'];
export type LearningGoal = typeof LEARNING_GOALS[number]['id'];
export type LearningStyle = typeof LEARNING_STYLES[number]['id'];

interface OnboardingState {
  currentStep: number;
  languageLevel: LanguageLevel | null;
  nativeLanguage: NativeLanguageCode | null;
  learningGoal: LearningGoal | null;
  timeCommitment: number | null;
  learningStyle: LearningStyle | null;
  isComplete: boolean;

  setCurrentStep: (step: number) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setNativeLanguage: (language: NativeLanguageCode) => void;
  setLearningGoal: (goal: LearningGoal) => void;
  setTimeCommitment: (minutes: number) => void;
  setLearningStyle: (style: LearningStyle) => void;
  setIsComplete: (isComplete: boolean) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(persist(
  (set) => ({
    currentStep: 0,
    languageLevel: null,
    nativeLanguage: null,
    learningGoal: null,
    timeCommitment: null,
    learningStyle: null,
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
      languageLevel: null,
      nativeLanguage: null,
      learningGoal: null,
      timeCommitment: null,
      learningStyle: null,
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