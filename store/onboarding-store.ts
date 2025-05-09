import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type LearningGoal = 'travel' | 'fluency' | 'work' | 'exam';
type LearningStyle = 'visual' | 'audio' | 'conversational';

interface OnboardingState {
  currentStep: number;
  languageLevel: LanguageLevel | null;
  nativeLanguage: string | null;
  learningGoals: LearningGoal[];
  timeCommitment: number | null;
  learningStyle: LearningStyle | null;
  isComplete: boolean;

  setCurrentStep: (step: number) => void;
  setLanguageLevel: (level: LanguageLevel) => void;
  setNativeLanguage: (language: string) => void;
  setLearningGoals: (goals: LearningGoal[]) => void;
  setTimeCommitment: (minutes: number) => void;
  setLearningStyle: (style: LearningStyle) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(persist(
  (set) => ({
    currentStep: 0,
    languageLevel: null,
    nativeLanguage: null,
    learningGoals: [],
    timeCommitment: null,
    learningStyle: null,
    isComplete: false,

    setCurrentStep: (step) => set({ currentStep: step }),
    setLanguageLevel: (level) => set({ languageLevel: level }),
    setNativeLanguage: (language) => set({ nativeLanguage: language }),
    setLearningGoals: (goals) => set({ learningGoals: goals }),
    setTimeCommitment: (minutes) => set({ timeCommitment: minutes }),
    setLearningStyle: (style) => set({ learningStyle: style }),
    completeOnboarding: () => set({ isComplete: true }),
    resetOnboarding: () => set({
      currentStep: 0,
      languageLevel: null,
      nativeLanguage: null,
      learningGoals: [],
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