import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { useOnboardingStore } from './onboarding-store'; // Import onboarding store

export type LessonType = 'vocabulary' | 'listening' | 'pronunciation' | 'roleplay' | 'shadowing' | 'voice_journaling' | 'word_pairs';

export interface Lesson {
  id: string;
  type: LessonType;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  locked: boolean;
}

export interface DailyPlan {
  date: string;
  lessons: Lesson[];
  totalXp: number;
  completedLessons: number;
}

interface LessonState {
  currentStreak: number;
  totalXp: number;
  dailyPlan: DailyPlan | null;
  isLoading: boolean;
  error: string | null;
  setDailyPlan: (plan: DailyPlan) => void;
  completeLesson: (lessonId: LessonType, actualScore?: number) => void; // Add actualScore parameter
  generateDailyPlan: () => Promise<void>;
}

export const useLessonStore = create<LessonState>()(persist(
  (set, get) => ({
  currentStreak: 0,
  totalXp: 0,
  dailyPlan: null,
  isLoading: false,
  error: null,

  setDailyPlan: (plan) => set({ dailyPlan: plan }),
  completeLesson: (lessonId: LessonType, actualScore?: number) => {
    const { dailyPlan } = get();
    if (!dailyPlan) return;

    const updatedLessons = dailyPlan.lessons.map((lesson) =>
      lesson.type === lessonId ? { ...lesson, completed: true } : lesson
    );

    const completedLesson = dailyPlan.lessons.find((l) => l.type === lessonId);
    if (completedLesson && !completedLesson.completed) { // Check if not already completed to avoid multiple increments
      const scoreToAdd = actualScore !== undefined ? actualScore : completedLesson.xpReward;
      set((state) => ({
        totalXp: state.totalXp + scoreToAdd, // Use actualScore if provided, otherwise xpReward
        currentStreak: state.currentStreak + 1, // Increment current streak
        dailyPlan: {
          ...dailyPlan,
          lessons: updatedLessons,
          completedLessons: dailyPlan.completedLessons + 1,
        },
      }));
    }
  },

  generateDailyPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { languageLevel, nativeLanguage, learningGoal, timeCommitment, learningStyle } = useOnboardingStore.getState();

      // Construct the prompt for the AI service
      const prompt = `Generate a personalized daily lesson plan for a user with the following preferences:
        Language Level: ${languageLevel}
        Native Language: ${nativeLanguage}
        Learning Goal: ${learningGoal}
        Time Commitment: ${timeCommitment} minutes per day
        Learning Style: ${learningStyle}
        
        The plan should include a variety of lesson types for each lesson, such as vocabulary, listening, pronunciation, roleplay, shadowing, voice journaling, and word pairs.
        Each lesson should have an id, type, title, description, xpReward, completed (boolean, default false), and locked (boolean, default false).
        The response should be a JSON object matching the DailyPlan interface.`;

      // Placeholder for AI service call
      console.log('Sending to AI Service:', prompt);
      // const aiGeneratedPlan = await callAIService(prompt); // Replace with actual AI service call

      // For now, we'll continue to use the mock plan until AI integration is complete
      // In a real scenario, you would parse the aiGeneratedPlan response here.
      const mockPlan: DailyPlan = {
        date: new Date().toISOString(),
        lessons: [
          {
            id: '1',
            type: 'vocabulary',
            title: 'Business Vocabulary',
            description: 'Learn essential business terms',
            xpReward: 100,
            completed: false,
            locked: false,
          },
          {
            id: '2',
            type: 'listening',
            title: 'Active Listening',
            description: 'Improve comprehension skills',
            xpReward: 120,
            completed: false,
            locked: false,
          },
          {
            id: '3',
            type: 'pronunciation',
            title: 'Difficult Sounds',
            description: 'Practice challenging phonemes',
            xpReward: 150,
            completed: false,
            locked: false,
          },
          {
            id: '4',
            type: 'roleplay',
            title: 'Job Interview',
            description: 'Practice common interview phrases',
            xpReward: 200,
            completed: false,
            locked: false,
          },
          {
            id: '5',
            type: 'shadowing',
            title: 'Native Speech',
            description: 'Mirror native speaker patterns',
            xpReward: 180,
            completed: false,
            locked: false,
          },
          {
            id: '6',
            type: 'voice_journaling',
            title: 'Daily Reflection',
            description: 'Record your thoughts in English',
            xpReward: 150,
            completed: false,
            locked: false,
          },
          {
            id: '7',
            type: 'word_pairs',
            title: 'Match Business Terms',
            description: 'Match related business vocabulary pairs',
            xpReward: 130,
            completed: false,
            locked: false,
          },
        ],
        totalXp: 900,
        completedLessons: 0,
      };
      set({ dailyPlan: mockPlan, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}),
{
  name: 'lesson-storage',
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
}));