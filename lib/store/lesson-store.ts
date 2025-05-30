import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { EnglishWord, TranslationWord } from '../types/word-pairs';
import { useOnboardingStore } from './onboarding-store'; // Import onboarding store

export type LessonType = 'vocabulary' | 'listening' | 'pronunciation' | 'roleplay' | 'shadowing' | 'voice_journaling' | 'word_pairs';

export interface Lesson {
  id: string;
  type: LessonType;
  title: string;
  description: string;
  xpReward: number; // For word_pairs, this is the sum of best scores for each set
  completed: boolean;
  locked: boolean;
  totalSets?: number; // Total number of sets for this lesson (e.g., 10 for word_pairs)
  completedSets?: number; // Number of unique sets attempted at least once
  setBestScores?: number[]; // Stores the best score achieved for each set
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
  // Word-pairs game state
  englishWords: EnglishWord[];
  translationWords: TranslationWord[];
  selectedPair: {index: number, column: 'english' | 'translation'} | null;
  matchedPairs: number[];
  score: number;
  incorrectPair: { english: number; translation: number } | null;
  lessonCompleted: boolean;
  currentSetIndex: number;
  madeError: boolean;
  
  setDailyPlan: (plan: DailyPlan) => void;
  // For word_pairs, pass currentSetIndex (0-indexed) and score for that attempt
  // For other lessons, actualScore is the total score for the lesson
  completeLesson: (lessonId: LessonType, scoreForAttemptOrLesson: number, currentSetIndex?: number) => void;
  generateDailyPlan: () => Promise<void>;
  resetWordPairsLesson: (lessonId: LessonType) => void;
  
  // Word-pairs setters
  setEnglishWords: (words: EnglishWord[]) => void;
  setTranslationWords: (words: TranslationWord[]) => void;
  setSelectedPair: (pair: {index: number, column: 'english' | 'translation'} | null) => void;
  setMatchedPairs: (pairs: number[]) => void;
  setScore: (score: number) => void;
  setIncorrectPair: (pair: { english: number; translation: number } | null) => void;
  setLessonCompleted: (completed: boolean) => void;
  setCurrentSetIndex: (index: number) => void;
  setMadeError: (error: boolean) => void;
}

export const useLessonStore = create<LessonState>()(persist(
  (set, get) => ({
  currentStreak: 0,
  totalXp: 0,
  dailyPlan: null,
  isLoading: false,
  error: null,
  
  // Word-pairs game state initial values
  englishWords: [],
  translationWords: [],
  selectedPair: null,
  matchedPairs: [],
  score: 0,
  incorrectPair: null,
  lessonCompleted: false,
  currentSetIndex: 0,
  madeError: false,

  setDailyPlan: (plan) => set({ dailyPlan: plan }),
  completeLesson: (lessonId: LessonType, scoreForAttemptOrLesson: number, currentSetIndex?: number) => {
    const { dailyPlan, totalXp, currentStreak } = get();
    if (!dailyPlan) return;

    let lessonNewlyFullyCompleted = false; // Tracks if this action makes the lesson fully complete for the first time
    let xpDeltaForTotal = 0; // How much the global totalXp should change
    let newTotalXp = totalXp;
    let newCurrentStreak = currentStreak;
    let newCompletedLessonsCount = dailyPlan.completedLessons;

    const newLessonsArray = dailyPlan.lessons.map(lesson => {
      if (lesson.type === lessonId) {
        const lessonToUpdate = { ...lesson }; // Create a mutable copy

        if (lessonToUpdate.type === 'word_pairs' && currentSetIndex !== undefined && lessonToUpdate.totalSets !== undefined) {
          lessonToUpdate.setBestScores = lessonToUpdate.setBestScores || Array(lessonToUpdate.totalSets).fill(0);
          
          const oldBestScoreForSet = lessonToUpdate.setBestScores[currentSetIndex] || 0;
          const newBestScoreForSet = Math.max(oldBestScoreForSet, scoreForAttemptOrLesson);
          
          if (newBestScoreForSet > oldBestScoreForSet) {
            xpDeltaForTotal += (newBestScoreForSet - oldBestScoreForSet);
            lessonToUpdate.setBestScores[currentSetIndex] = newBestScoreForSet;
            // Recalculate lesson's total xpReward from all best set scores
            lessonToUpdate.xpReward = lessonToUpdate.setBestScores.reduce((sum, score) => sum + score, 0);
          }

          // Increment completedSets if this set is being successfully played for the first time
          // (assuming scoreForAttemptOrLesson > 0 means a successful play for set counting purposes)
          // and it wasn't counted before (oldBestScoreForSet was 0)
          if (oldBestScoreForSet === 0 && scoreForAttemptOrLesson > 0) {
            lessonToUpdate.completedSets = (lessonToUpdate.completedSets || 0) + 1;
          }

          if (!lessonToUpdate.completed && (lessonToUpdate.completedSets || 0) >= lessonToUpdate.totalSets) {
            lessonToUpdate.completed = true;
            lessonNewlyFullyCompleted = true;
          }

        } else if (lessonToUpdate.type !== 'word_pairs') {
          // For other lesson types, standard completion logic
          if (!lessonToUpdate.completed) {
            lessonToUpdate.completed = true;
            lessonNewlyFullyCompleted = true;
            // For non-word-pairs, scoreForAttemptOrLesson is the total XP for that lesson
            // If it's a fixed reward lesson, it should already be in lessonToUpdate.xpReward
            // If scoreForAttemptOrLesson is provided, it overrides
            xpDeltaForTotal += scoreForAttemptOrLesson; // This assumes scoreForAttemptOrLesson is the XP for this lesson
            lessonToUpdate.xpReward = scoreForAttemptOrLesson; // Update lesson's xpReward to what was scored
          }
        }
        return lessonToUpdate;
      }
      return lesson;
    });

    newTotalXp += xpDeltaForTotal;

    if (lessonNewlyFullyCompleted) {
      // This logic ensures streak and completed count only increment if the lesson state *changed* to completed
      // No need to check originalLesson.completed as lessonNewlyFullyCompleted is only true if it wasn't completed before.
      newCurrentStreak += 1;
      newCompletedLessonsCount += 1;
    }

    set({
      totalXp: newTotalXp,
      currentStreak: newCurrentStreak,
      dailyPlan: {
        ...dailyPlan,
        lessons: newLessonsArray,
        completedLessons: newCompletedLessonsCount,
      },
    });
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
            xpReward: 0, // Initial XP for word_pairs is 0, sum of setBestScores
            completed: false,
            locked: false,
            totalSets: 10, // Example: 10 sets for word_pairs
            completedSets: 0, // Number of unique sets attempted
            setBestScores: Array(10).fill(0), // Initialize best scores for 10 sets
          },
        ],
        totalXp: 2000,
        completedLessons: 0,
      };
      set({ dailyPlan: mockPlan, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  resetWordPairsLesson: (lessonId: LessonType) => {
    const { dailyPlan, totalXp } = get();
    if (!dailyPlan) return;

    // Find the lesson and calculate XP to subtract
    const targetLesson = dailyPlan.lessons.find(lesson => lesson.type === lessonId);
    if (!targetLesson) return;

    const xpToSubtract = targetLesson.xpReward;
    let newCompletedLessonsCount = dailyPlan.completedLessons;
    let newCurrentStreak = get().currentStreak;
    
    // If lesson was completed, decrement completed lessons count and streak
    if (targetLesson.completed) {
      newCompletedLessonsCount = Math.max(0, dailyPlan.completedLessons - 1);
      // Decrement current streak by 1 since we're undoing one lesson completion
      newCurrentStreak = Math.max(0, newCurrentStreak - 1);
    }

    // Reset the lesson progress in daily plan
    const newLessonsArray = dailyPlan.lessons.map(lesson => {
      if (lesson.type === lessonId) {
        return {
          ...lesson,
          xpReward: 0,
          completed: false,
          completedSets: 0,
          setBestScores: lesson.totalSets ? Array(lesson.totalSets).fill(0) : [],
        };
      }
      return lesson;
    });

    // Update the store with reset lesson progress and adjusted XP
    set({
      dailyPlan: {
        ...dailyPlan,
        lessons: newLessonsArray,
        completedLessons: newCompletedLessonsCount,
      },
      totalXp: Math.max(0, totalXp - xpToSubtract),
      currentStreak: newCurrentStreak,
      // Reset game state
      englishWords: [],
      translationWords: [],
      selectedPair: null,
      matchedPairs: [],
      score: 0,
      incorrectPair: null,
      lessonCompleted: false,
      currentSetIndex: 0,
      madeError: false,
    });
  },
  
  // Word-pairs setters
  setEnglishWords: (words) => set({ englishWords: words }),
  setTranslationWords: (words) => set({ translationWords: words }),
  setSelectedPair: (pair) => set({ selectedPair: pair }),
  setMatchedPairs: (pairs) => set({ matchedPairs: pairs }),
  setScore: (score) => set({ score }),
  setIncorrectPair: (pair) => set({ incorrectPair: pair }),
  setLessonCompleted: (completed) => set({ lessonCompleted: completed }),
  setCurrentSetIndex: (index) => set({ currentSetIndex: index }),
  setMadeError: (error) => set({ madeError: error }),
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