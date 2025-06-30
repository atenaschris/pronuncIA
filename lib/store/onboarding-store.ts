import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { LANGUAGE_LEVELS, LEARNING_GOALS, LEARNING_STYLES, NATIVE_LANGUAGES, TIME_OPTIONS } from '@/lib/constants/constants';
import { appStorage, createMMKVStorage } from '../storage/storage-utils';
import { OnboardingState } from '../types/onboarding-types';


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
    storage: createJSONStorage(() => createMMKVStorage(appStorage)),
  }
));