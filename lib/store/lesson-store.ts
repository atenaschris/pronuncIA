import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EnglishWord, TranslationWord } from '../types/word-pairs';
import { useOnboardingStore } from './onboarding-store'; // Import onboarding store
import { createMMKVStorage, userDataStorage } from '../storage/storage-utils';

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
  currentTimeBonusXP?: number; // Current time bonus XP applied (can change as user takes more time)
  // Session state embedded directly in the lesson
  sessionState?: WordPairsState | VocabularyState | ListeningState | PronunciationState | RoleplayState | ShadowingState | VoiceJournalingState;
}

export interface DailyPlan {
  date: string;
  lessons: Lesson[];
  totalXp: number;
  completedLessons: number;
}

// Word-pairs specific state
export interface WordPairsState {
  englishWords: EnglishWord[];
  translationWords: TranslationWord[];
  selectedPair: {index: number, column: 'english' | 'translation'} | null;
  matchedPairs: number[];
  score: number;
  incorrectPair: { english: number; translation: number } | null;
  lessonCompleted: boolean;
  currentSetIndex: number;
  isReplayingForErrors: boolean; // Tracks when replay button is clicked for error fixing
  errorDetails: {
    incorrectMatches: Array<{
      englishWord: EnglishWord;
      attemptedTranslation: TranslationWord;
      correctTranslation: TranslationWord;
      timestamp: number;
      setIndex: number;
    }>;
    totalErrors: number;
  };
  // Timer functionality
  setTimers: number[]; // Array of completion times for each set (in seconds)
  currentSetStartTime: number | null; // Timestamp when current set started
  currentSetElapsedTime: number; // Current elapsed time for the active set (in seconds)
  totalSessionTime: number; // Total time spent across all sets in this session (in seconds)
  isPaused: boolean; // Whether the current set timer is paused
  pauseStartTime: number | null; // Timestamp when pause started
  totalPauseTime: number; // Total time spent paused in current set (in seconds)
  pauseCount: number; // Number of times user has paused in current set (max 2)
  isGoingBack: boolean; // Whether user is going back From Go Back Modal
}

// Placeholder interfaces for other lesson types
export interface VocabularyState {
  // Vocabulary-specific session state
}

export interface ListeningState {
  // Listening-specific session state
}

export interface PronunciationState {
  // Pronunciation-specific session state
}

export interface RoleplayState {
  // Roleplay-specific session state
}

export interface ShadowingState {
  // Shadowing-specific session state
}

export interface VoiceJournalingState {
  // Voice journaling-specific session state
}

// Word-pairs actions interface
export interface WordPairsActions {
  
}

interface LessonState {
  // Common lesson state
  currentStreak: number;
  totalXp: number;
  dailyPlan: DailyPlan | null;
  isLoading: boolean;
  error: string | null;
  
  // Common actions
  setDailyPlan: (plan: DailyPlan) => void;
  completeLesson: (lessonId: LessonType, scoreForAttemptOrLesson: number, currentSetIndex?: number) => void;
  generateDailyPlan: () => Promise<void>;
  
  // Lesson-specific actions
  setEnglishWords: (lessonId: string, words: EnglishWord[]) => void;
  setTranslationWords: (lessonId: string, words: TranslationWord[]) => void;
  setSelectedPair: (lessonId: string, pair: {index: number, column: 'english' | 'translation'} | null) => void;
  setMatchedPairs: (lessonId: string, pairs: number[]) => void;
  setScore: (lessonId: string, score: number) => void;
  setIncorrectPair: (lessonId: string, pair: { english: number; translation: number } | null) => void;
  setCurrentSetCompleted: (lessonId: string, completed: boolean) => void;
  setCurrentSetIndex: (lessonId: string, index: number) => void;
  setIsReplayingForErrors: (lessonId: string, isReplaying: boolean) => void;
  addErrorDetail: (lessonId: string, englishWord: string, attemptedTranslation: string, setIndex: number) => void;
  clearCurrentSetErrors: (lessonId: string, setIndex: number) => void;
  resetWordPairsLesson: (lessonId: string) => void;
  getWordPairsState: (lessonId: string) => WordPairsState | null;
  // Timer methods
  startSetTimer: (lessonId: string) => void;
  stopSetTimer: (lessonId: string) => void;
  updateCurrentSetElapsedTime: (lessonId: string) => void;
  pauseSetTimer: (lessonId: string) => void;
  resumeSetTimer: (lessonId: string) => void;
  resetTimers: (lessonId: string) => void;
  clearSetTimer: (lessonId: string, setIndex: number) => void;
  addTimeBonusXP: (lessonId: string, bonusXP: number) => void;
  setIsGoingBack: (lessonId: string, isGoingBack: boolean) => void;
  // Helper methods
  initializeLessonSessionState: (lessonId: string, lessonType: LessonType) => void;
}

export const useLessonStore = create<LessonState>()(persist(
  (set, get) => ({
  // Common lesson state
  currentStreak: 0,
  totalXp: 0,
  dailyPlan: null,
  isLoading: false,
  error: null,
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
      if (lesson.id === lessonId) {
        const lessonToUpdate = { ...lesson }; // Create a mutable copy

        if (lessonToUpdate.type === 'word_pairs' && currentSetIndex !== undefined && lessonToUpdate.totalSets !== undefined) {
          const currentBestScores = lessonToUpdate.setBestScores || Array(lessonToUpdate.totalSets).fill(0);
          
          const oldBestScoreForSet = currentBestScores[currentSetIndex] || 0;
          
          // Always update the score for the current attempt, whether it's better or worse
          // This ensures XP is always accurate based on the most recent performance
          const scoreDifference = scoreForAttemptOrLesson - oldBestScoreForSet;
          xpDeltaForTotal += scoreDifference; // Can be positive or negative
          
          // Create a new array with the updated score to maintain immutability
          const newBestScores = [...currentBestScores];
          newBestScores[currentSetIndex] = scoreForAttemptOrLesson;
          lessonToUpdate.setBestScores = newBestScores;
          
          // Recalculate lesson's total xpReward from all set scores
          // Preserve any accumulated time bonus when recalculating
          const baseXPFromSets = lessonToUpdate.setBestScores.reduce((sum, score) => sum + score, 0);
          const currentTimeBonus = lessonToUpdate.currentTimeBonusXP || 0;
          lessonToUpdate.xpReward = baseXPFromSets + currentTimeBonus;

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
  
  // Helper method to initialize lesson session state
  initializeLessonSessionState: (lessonId: string, lessonType: LessonType) => {
    set((state) => {
      if (!state.dailyPlan) return state;
      
      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.type === lessonType) {
          // Only initialize if no session state exists
          if (lesson.sessionState) {
            return lesson; // Keep existing session state
          }
          
          let sessionState;
          
          switch (lessonType) {
            case 'word_pairs':
              sessionState = {
                englishWords: [],
                translationWords: [],
                selectedPair: null,
                matchedPairs: [],
                score: 0,
                incorrectPair: null,
                lessonCompleted: false,
                currentSetIndex: 0,
                errorDetails: {
                  incorrectMatches: [],
                  totalErrors: 0,
                },
                setTimers: [],
                currentSetStartTime: null,
                currentSetElapsedTime: 0,
                totalSessionTime: 0,
                isPaused: false,
                isReplayingForErrors: false,
                pauseStartTime: null,
                totalPauseTime: 0,
                pauseCount: 0,
                isGoingBack: false,
              } as WordPairsState;
              break;
            default:
              sessionState = {};
          }
          
          return {
            ...lesson,
            sessionState,
          };
        }
        return lesson;
      });
      
      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
      };
    });
  },

// Word-pairs actions
  getWordPairsState: (lessonId: string) => {
    const { dailyPlan } = get();
    if (!dailyPlan) return null;
    
    const lesson = dailyPlan.lessons.find(l => l.id === lessonId);
    return lesson?.sessionState as WordPairsState || null;
  },
  
  setCurrentSetCompleted: (lessonId: string, completed: boolean) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            lessonCompleted: completed,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  resetWordPairsLesson: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    // Find the lesson to get its current xpReward and completion status
    const lessonToReset = state.dailyPlan.lessons.find(lesson => lesson.id === lessonId);
    if (!lessonToReset) return state;
    
    const wasCompleted = lessonToReset.completed;
    const currentLessonXp = lessonToReset.xpReward || 0;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId) {
        return {
          ...lesson,
          xpReward: 0,
          completed: false,
          completedSets: 0,
          setBestScores: [],
          currentTimeBonusXP: 0,
          sessionState: {
              englishWords: [],
              translationWords: [],
              currentSetIndex: 0,
              selectedPair: null,
              matchedPairs: [],
              score: 0,
              incorrectPair: null,
              lessonCompleted: false,
              errorDetails: {
                incorrectMatches: [],
                totalErrors: 0,
              },
              setTimers: [],
              currentSetStartTime: null,
              currentSetElapsedTime: 0,
              totalSessionTime: 0,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: 0,
              pauseCount: 0,
              isReplayingForErrors: false,
              isGoingBack: false,
            } as WordPairsState,
        };
      }
      return lesson;
    });
    
    // Calculate new global state values
    const newTotalXp = Math.max(0, state.totalXp - currentLessonXp);
    const newCurrentStreak = wasCompleted ? Math.max(0, state.currentStreak - 1) : state.currentStreak;
    const newCompletedLessonsCount = wasCompleted ? Math.max(0, state.dailyPlan.completedLessons - 1) : state.dailyPlan.completedLessons;
    const newDailyPlanTotalXp = Math.max(0, state.dailyPlan.totalXp - currentLessonXp);
    
    return {
      ...state,
      totalXp: newTotalXp,
      currentStreak: newCurrentStreak,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
        totalXp: newDailyPlanTotalXp,
        completedLessons: newCompletedLessonsCount,
      },
    };
  }),
  
  setEnglishWords: (lessonId: string, words: EnglishWord[]) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            englishWords: words,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  setTranslationWords: (lessonId: string, words: TranslationWord[]) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            translationWords: words,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  setCurrentSetIndex: (lessonId: string, index: number) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            currentSetIndex: index,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  setIsReplayingForErrors: (lessonId: string, isReplaying: boolean) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            isReplayingForErrors: isReplaying,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  setSelectedPair: (lessonId: string, pair: {index: number, column: 'english' | 'translation'} | null) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            selectedPair: pair,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  setMatchedPairs: (lessonId: string, pairs: number[]) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            matchedPairs: pairs,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  setScore: (lessonId: string, score: number) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            score: score,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  setIncorrectPair: (lessonId: string, pair: { english: number; translation: number } | null) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        return {
          ...lesson,
          sessionState: {
            ...lesson.sessionState,
            incorrectPair: pair,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),
  
  addErrorDetail: (lessonId: string, englishWord: string, attemptedTranslation: string, setIndex: number) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        return {
          ...lesson,
          sessionState: {
            ...currentState,
            errorDetails: {
              incorrectMatches: [
                ...currentState.errorDetails.incorrectMatches,
                {
                  englishWord,
                  attemptedTranslation,
                  timestamp: Date.now(),
                  setIndex,
                }
              ],
              totalErrors: currentState.errorDetails.totalErrors + 1,
            },
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  clearCurrentSetErrors: (lessonId: string, setIndex: number) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        const filteredMatches = currentState.errorDetails.incorrectMatches.filter(
          error => error.setIndex !== setIndex
        );
        return {
          ...lesson,
          sessionState: {
            ...currentState,
            errorDetails: {
              incorrectMatches: filteredMatches,
              totalErrors: filteredMatches.length, // Recalculate totalErrors based on remaining errors
            },
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  // Timer methods implementation
  startSetTimer: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        return {
          ...lesson,
          sessionState: {
            ...currentState,
            currentSetStartTime: Date.now(),
            currentSetElapsedTime: 0,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  stopSetTimer: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        if (currentState.currentSetStartTime) {
          // If paused, add current pause duration to total pause time
          let totalPauseTime = currentState.totalPauseTime || 0;
          if (currentState.isPaused && currentState.pauseStartTime) {
            totalPauseTime += Math.floor((Date.now() - currentState.pauseStartTime) / 1000);
          }
          
          const completionTime = Math.floor((Date.now() - currentState.currentSetStartTime - totalPauseTime * 1000) / 1000);
          const newSetTimers = [...currentState.setTimers];
          newSetTimers[currentState.currentSetIndex] = completionTime;
          
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              setTimers: newSetTimers,
              currentSetStartTime: null,
              currentSetElapsedTime: completionTime,
              totalSessionTime: currentState.totalSessionTime + completionTime,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: 0,
              pauseCount: 0,
            } as WordPairsState,
          };
        }
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  updateCurrentSetElapsedTime: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        if (currentState.currentSetStartTime && !currentState.isPaused) {
          const elapsedTime = Math.floor((Date.now() - currentState.currentSetStartTime - (currentState.totalPauseTime || 0) * 1000) / 1000);
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              currentSetElapsedTime: elapsedTime,
            } as WordPairsState,
          };
        }
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  pauseSetTimer: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        if (currentState.currentSetStartTime && !currentState.isPaused) {
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              isPaused: true,
              pauseStartTime: Date.now(),
              pauseCount: currentState.pauseCount + 1,
            } as WordPairsState,
          };
        }
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  resumeSetTimer: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        if (currentState.isPaused && currentState.pauseStartTime) {
          const pauseDuration = Math.floor((Date.now() - currentState.pauseStartTime) / 1000);
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: (currentState.totalPauseTime || 0) + pauseDuration,
            } as WordPairsState,
          };
        }
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  resetTimers: (lessonId: string) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        return {
          ...lesson,
          sessionState: {
            ...currentState,
            setTimers: [],
            currentSetStartTime: null,
            currentSetElapsedTime: 0,
            totalSessionTime: 0,
            isPaused: false,
            pauseStartTime: null,
            totalPauseTime: 0,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  clearSetTimer: (lessonId: string, setIndex: number) => set((state) => {
    if (!state.dailyPlan) return state;
    
    const updatedLessons = state.dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId && lesson.sessionState) {
        const currentState = lesson.sessionState as WordPairsState;
        const newSetTimers = [...currentState.setTimers];
        delete newSetTimers[setIndex]; // Remove the timer for this specific set
        
        return {
          ...lesson,
          sessionState: {
            ...currentState,
            setTimers: newSetTimers,
          } as WordPairsState,
        };
      }
      return lesson;
    });
    
    return {
      ...state,
      dailyPlan: {
        ...state.dailyPlan,
        lessons: updatedLessons,
      },
    };
  }),

  // Add time bonus XP to a lesson
  addTimeBonusXP: (lessonId: string, bonusXP: number) => {
    const { dailyPlan, totalXp } = get();
    if (!dailyPlan) return;

    let bonusDifference = 0;
    const updatedLessons = dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId) {
        // Calculate the difference between new and current time bonus
        const currentBonus = lesson.currentTimeBonusXP || 0;
        bonusDifference = bonusXP - currentBonus;
        
        return {
          ...lesson,
          xpReward: lesson.xpReward + bonusDifference,
          currentTimeBonusXP: bonusXP,
        };
      }
      return lesson;
    });

    // Update totalXp to reflect the time bonus change
    set({
      totalXp: totalXp + bonusDifference,
      dailyPlan: {
        ...dailyPlan,
        lessons: updatedLessons,
      },
    });
  },
  setIsGoingBack: (lessonId, isGoingBack: boolean) => {
    const {dailyPlan} = get();
    if (!dailyPlan) return;

    const updatedLessons = dailyPlan.lessons.map(lesson => {
      if (lesson.id === lessonId) {
        return {
         ...lesson,
          sessionState: {
           ...lesson.sessionState,
            isGoingBack: isGoingBack,
          } as WordPairsState,
        };
      }
      return lesson; 
    })
    set({
      dailyPlan: {
        ...dailyPlan,
        lessons: updatedLessons,
      },
    })
  },
}),
{
  name: 'lesson-storage',
  storage: createJSONStorage(() => createMMKVStorage(userDataStorage)),
}));