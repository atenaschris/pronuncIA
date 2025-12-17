import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  areConsecutiveDays,
  calculateFreezesNeeded,
  calculateGapDays,
  canCoverGap
} from '../helpers/date-streak-utils';
import type { PerformanceLog, PerformanceMetrics, SpacedRepetitionData } from '../helpers/performance-utils';
import {
  calculatePerformanceSnapshot,
  calculateSpacedRepetitionNeeds,
  calculateUserPerformanceMetrics,
  createDefaultLessonTypeStats,
  getDateKey,
  initPerformanceLogEntry,
  rollUpCompletedLessonToLog,
  rollUpFreezeUsageToLog,
  rollUpGeneratedPlanToLog,
  selectEffectivePerformanceMetrics,
} from '../helpers/performance-utils';
import { aiService } from '../services/ai-service'; // Import AI service
import { buildDailyPlanPrompt } from '../services/plan-prompt-builder';
import { generateDailyPlanWithFallback } from '../services/planning-service';
import { createMMKVStorage, userDataStorage } from '../storage/storage-utils';
import { VocabularyState, VocabularyWord } from '../types/vocabulary';
import { NativeWord, TranslationWord, WordPair, WordPairsState } from '../types/word-pairs';
import { useOnboardingStore } from './onboarding-store'; // Import onboarding store

export type LessonType = 'vocabulary' | 'listening' | 'pronunciation' | 'roleplay' | 'shadowing' | 'voice_journaling' | 'word_pairs';

export interface Lesson {
  id: string;
  type: LessonType;
  title: string;
  description: string;
  xpReward: number; // For word_pairs, this is the sum of best scores for each set
  rewardableXP: number; // Maximum potential XP that can be earned from this lesson
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
  id: string;
  date: string;
  lessons: Lesson[];
  totalXp: number;
  completedLessons: number;
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
    currentStreak: number;
    totalXp: number;
    streakFreezes: number; // Number of streak freezes available
    maxStreakFreezes: number; // Maximum streak freezes user can hold
    dailyPlan: DailyPlan | null;
    performanceLog: PerformanceLog; // Date-keyed log for daily/lifetime summaries
    lastActivityDate: string | null; // Track last day user completed any lesson (YYYY-MM-DD format)
    lastValidationDate: string | null; // Track last day streak validation was performed (YYYY-MM-DD format)
    streakNotificationLastShown: string | null; // Track last day a streak notification was shown
    dateOverride: string | null; // For time travel debugging
    mockPronunciationAnalysis: boolean; // Test-only: mock AI accuracy
  isLoading: boolean;
  error: string | null;
  // Lifetime cumulative metrics (persisted)
  lifetimeLessonsSeen: number; // Total lessons generated across all daily plans
  lifetimeLessonsCompleted: number; // Total lessons completed across all days
  lifetimeAccuracyTotal: number; // Sum of per-lesson accuracy values (vocabulary avg aiScores, word_pairs avg setBestScores)
  lifetimeAccuracyCount: number; // Number of lessons contributing to accuracy
  lastCountedPlanDate: string | null; // The last date for which lessonsSeen was incremented
  // Lifetime per-lesson-type statistics to enable stable preferences/struggles
  lifetimeLessonTypeStats?: Record<LessonType, {
    total: number; // total lessons of this type generated in plans
    completed: number; // lessons of this type completed
    accuracyTotal: number; // sum of per-lesson accuracy values for this type
    accuracyCount: number; // count of lessons contributing to accuracy for this type
  }>;
  // Content caching removed; React Query owns caching for content generation

  // Actions
  setDailyPlan: (plan: DailyPlan) => void;
  completeLesson: (lessonId: LessonType, scoreForAttemptOrLesson: number, currentSetIndex?: number) => void;
  generateDailyPlan: (forceRegenerate?: boolean) => Promise<void>;
  setDateOverride: (date: string | null) => void; // For time travel debugging
  setMockPronunciationAnalysis: (enabled: boolean) => void; // Toggle mock accuracy

  // Content generation methods
  generateVocabularyContent: (lessonId: string) => Promise<VocabularyWord[]>;
  generateWordPairsContent: (lessonId: string) => Promise<Record<string, WordPair[]>>;

  // WordPairs-specific actions
  setNativeWords: (lessonId: string, words: NativeWord[]) => void;
  setTranslationWords: (lessonId: string, words: TranslationWord[]) => void;
  setSelectedPair: (lessonId: string, pair: { index: number, column: 'native' | 'translation' } | null) => void;
  setMatchedPairs: (lessonId: string, pairs: number[]) => void;
  setScore: (lessonId: string, score: number) => void;
  setIncorrectPair: (lessonId: string, pair: { native: number; translation: number } | null) => void;
  setCurrentSetCompleted: (lessonId: string, completed: boolean) => void;
  setCurrentSetIndex: (lessonId: string, index: number) => void;
  setIsReplayingForErrors: (lessonId: string, isReplaying: boolean) => void;
  addErrorDetail: (lessonId: string, nativeWord: string, attemptedTranslation: string, setIndex: number, correctTranslation: string, targetSound?: string) => void;
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

  // Vocabulary-specific actions
  getVocabularyState: (lessonId: string) => VocabularyState | null;
  setVocabularyWords: (lessonId: string, words: VocabularyWord[]) => void;
  setCurrentWordIndex: (lessonId: string, index: number) => void;
  incrementVocabularyAttempts: (lessonId: string) => void;
  resetVocabularyAttempts: (lessonId: string) => void;
  setVocabularyCompleted: (lessonId: string, completed: boolean) => void;
  addUserRecording: (lessonId: string, recording: string) => void;
  addAIScore: (lessonId: string, score: number) => void;
  setFeedback: (lessonId: string, feedback: string | null) => void;
  setShowFeedback: (lessonId: string, show: boolean) => void;
  addFailedWord: (lessonId: string, wordIndex: number) => void;
  addSkippedWord: (lessonId: string, wordIndex: number) => void;
  addSuccessWord: (lessonId: string, wordIndex: number) => void;
  removeSkippedWord: (lessonId: string, wordIndex: number) => void;
  moveSkippedToIncomplete: (lessonId: string, wordIndex: number) => void;
  retryIncompleteWord: (lessonId: string, wordIndex: number) => void;
  removeIncompleteWord: (lessonId: string, wordIndex: number) => void;
  addCompletedWord: (lessonId: string, wordIndex: number) => void;
  removeCompletedWord: (lessonId: string, wordIndex: number) => void;
  // Vocabulary timer methods
  startWordTimer: (lessonId: string) => void;
  stopWordTimer: (lessonId: string) => void;
  updateCurrentWordElapsedTime: (lessonId: string) => void;
  pauseWordTimer: (lessonId: string) => void;
  resumeWordTimer: (lessonId: string) => void;
  resetVocabularyTimers: (lessonId: string) => void;
  resetVocabularyLesson: (lessonId: string) => void;
  clearWordTimer: (lessonId: string, wordIndex: number) => void;
  addVocabularyWordXP: (lessonId: string, wordXP: number) => void;
  calculateWordXP: (lessonId: string, wordIndex: number, aiScore: number, currentAttempt?: number, wordDifficulty?: 'easy' | 'medium' | 'hard') => number;
  resumeWordTimerFromElapsed: (lessonId: string) => void;
  getLesson: (lessonId: string) => Lesson | null;
  // Derived, memoized daily performance metrics
  getPerformanceMetrics: () => PerformanceMetrics;
  getSpacedRepetitionNeeds: () => SpacedRepetitionData;
  
  // Streak freeze functions
  purchaseStreakFreeze: () => boolean;
  validateDailyStreak: () => { status: 'no_previous_activity' | 'streak_maintained' | 'freeze_used' | 'streak_lost' | 'gap_too_large'; streakProtected?: number; freezesRemaining?: number; lostStreak?: number; gapDays?: number; freezesUsed?: number; };
  checkDailyGoalMet: () => boolean;
  useStreakFreeze: () => boolean;
  setStreakNotificationLastShown: (date: string) => void;
}

// Helper function to get today's date in YYYY-MM-DD format
export const getTodayDateString = (): string => {
  const { dateOverride } = useLessonStore.getState();
  if (dateOverride) {
    return dateOverride;
  }
  return new Date().toISOString().split('T')[0];
};

export const useLessonStore = create<LessonState>()(persist(
  (set, get) => ({
    currentStreak: 0,
    totalXp: 0,
    streakFreezes: 2, // Start with 2 streak freezes like Duolingo
    maxStreakFreezes: 3, // Maximum of 3 streak freezes (can cover up to 9 days total)
    dailyPlan: null,
    performanceLog: {},
    lastActivityDate: null,
    lastValidationDate: null,
    streakNotificationLastShown: null,
    dateOverride: null, // For time travel debugging
    mockPronunciationAnalysis: false, // Default: real AI accuracy
    isLoading: false,
    error: null,
    // Lifetime cumulative metrics defaults
    lifetimeLessonsSeen: 0,
    lifetimeLessonsCompleted: 0,
    lifetimeAccuracyTotal: 0,
    lifetimeAccuracyCount: 0,
    lastCountedPlanDate: null,
    lifetimeLessonTypeStats: {
      vocabulary: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
      listening: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
      pronunciation: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
      roleplay: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
      shadowing: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
      voice_journaling: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
      word_pairs: { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 },
    },
    
    // Content caching
      // Removed cache state; handled by React Query
    setDailyPlan: (plan) => set({ dailyPlan: plan }),
    setDateOverride: (date) => set({ dateOverride: date }), // For time travel debugging
    setMockPronunciationAnalysis: (enabled) => set({ mockPronunciationAnalysis: enabled }),
    completeLesson: (lessonId: LessonType, scoreForAttemptOrLesson: number, currentSetIndex?: number) => {
      const { dailyPlan, totalXp, currentStreak, lastActivityDate, lifetimeLessonsCompleted, lifetimeAccuracyTotal, lifetimeAccuracyCount, lifetimeLessonTypeStats, performanceLog } = get();
      if (!dailyPlan) return;

      let lessonNewlyFullyCompleted = false; // Tracks if this action makes the lesson fully complete for the first time
      let xpDeltaForTotal = 0; // How much the global totalXp should change
      let newTotalXp = totalXp;
      let newCurrentStreak = currentStreak;
      let newLastActivityDate = lastActivityDate;
      let newCompletedLessonsCount = dailyPlan.completedLessons;
      let newLifetimeLessonsCompleted = lifetimeLessonsCompleted;
      let newLifetimeAccuracyTotal = lifetimeAccuracyTotal;
      let newLifetimeAccuracyCount = lifetimeAccuracyCount;
      let setCompletionEvent = false;

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
              setCompletionEvent = true;
            }

            if (!lessonToUpdate.completed && (lessonToUpdate.completedSets || 0) >= lessonToUpdate.totalSets) {
              lessonToUpdate.completed = true;
              lessonNewlyFullyCompleted = true;
            }
          } else if (lessonToUpdate.type === 'vocabulary') {
            // For vocabulary lessons, handle XP accumulation and completion
            // The XP has already been accumulated through addVocabularyWordXP calls

            // Mark lesson as completed if not already completed
            if (!lessonToUpdate.completed) {
              lessonToUpdate.completed = true;
              lessonNewlyFullyCompleted = true;
              // Add the lesson's accumulated XP to the global total on first completion
              xpDeltaForTotal = lessonToUpdate.xpReward;
            } else {
              // If already completed, add any additional XP from retried words
              // The scoreForAttemptOrLesson parameter contains the XP delta for retried words
              xpDeltaForTotal = scoreForAttemptOrLesson;
            }
          } else {
            // For other lesson types, standard completion logic
            if (!lessonToUpdate.completed) {
              lessonToUpdate.completed = true;
              lessonNewlyFullyCompleted = true;
            }
          }

          return lessonToUpdate;
        }
        return lesson;
      });
      newTotalXp += xpDeltaForTotal;

      let newPerformanceLog: PerformanceLog = performanceLog || {};
      // Micro-activity: increment in-lesson events for newly completed set
      if (setCompletionEvent) {
        const dateKey = getDateKey(dailyPlan.date);
        const existingEntry = newPerformanceLog[dateKey];
        const entry = existingEntry
          ? { ...existingEntry, byType: { ...existingEntry.byType } }
          : initPerformanceLogEntry();
        // Treat in-lesson activity as a boolean (0/1) instead of an unbounded counter
        entry.inLessonEvents = 1;
        newPerformanceLog = { ...newPerformanceLog, [dateKey]: entry };
      }
      if (lessonNewlyFullyCompleted) {
        // This logic ensures streak and completed count only increment if the lesson state *changed* to completed
        // No need to check originalLesson.completed as lessonNewlyFullyCompleted is only true if it wasn't completed before.
        newCompletedLessonsCount += 1;
        newLifetimeLessonsCompleted += 1;

        // Contribute per-lesson accuracy to lifetime totals once upon first completion
        const justCompletedLesson = newLessonsArray.find(l => l.id === lessonId);
        if (justCompletedLesson) {
          // Update lifetime lesson-type stats
          const stats = { ...(lifetimeLessonTypeStats || createDefaultLessonTypeStats()) };
          const lt = justCompletedLesson.type;
          if (!stats[lt]) {
            stats[lt] = { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 };
          }
          stats[lt].completed += 1;
          if (justCompletedLesson.type === 'vocabulary') {
            const vs = justCompletedLesson.sessionState as VocabularyState | undefined;
            const aiScores = vs?.aiScores;
            if (aiScores && aiScores.length > 0) {
              const lessonAccuracy = aiScores.reduce((sum: number, score: number) => sum + score, 0) / aiScores.length;
              newLifetimeAccuracyTotal += lessonAccuracy;
              newLifetimeAccuracyCount += 1;
              stats[lt].accuracyTotal += lessonAccuracy;
              stats[lt].accuracyCount += 1;
            }
          } else if (justCompletedLesson.type === 'word_pairs' && Array.isArray(justCompletedLesson.setBestScores) && justCompletedLesson.setBestScores.length > 0) {
            const setBestScores = justCompletedLesson.setBestScores as number[];
            const lessonAccuracy = setBestScores.reduce((sum: number, score: number) => sum + score, 0) / setBestScores.length;
            newLifetimeAccuracyTotal += lessonAccuracy;
            newLifetimeAccuracyCount += 1;
            stats[lt].accuracyTotal += lessonAccuracy;
            stats[lt].accuracyCount += 1;
          }
          // Persist updated type stats immediately
          set({ lifetimeLessonTypeStats: stats });

          // Roll up this newly completed lesson into the date-keyed performance log
          const todayDateForLog = getTodayDateString();
          newPerformanceLog = rollUpCompletedLessonToLog(newPerformanceLog, justCompletedLesson, todayDateForLog);
        }
        
        // Update streak based on consecutive days, not lesson count
        const today = getTodayDateString();
        
        if (!newLastActivityDate) {
          // First ever lesson completion - start streak at 1
          newCurrentStreak = 1;
        } else if (newLastActivityDate === today) {
          // Already completed a lesson today - streak stays the same
          // (multiple lessons in same day don't increase streak)
        } else if (areConsecutiveDays(newLastActivityDate, today)) {
          // Completed lesson on consecutive day - increment streak
          newCurrentStreak += 1;
        } else {
          // Gap in activity - use enhanced streak validation system
          const streakResult = get().validateDailyStreak();
          
          if (streakResult.status === 'freeze_used' || streakResult.status === 'streak_lost' || streakResult.status === 'gap_too_large') {
            // Import and call streak notification system
            import('../../components/learn/streak-notification').then(({ checkAndNotifyStreakStatus }) => {
              checkAndNotifyStreakStatus(() => streakResult);
            });
          }
          
          // Roll up streak freeze usage into performance log when freezes are consumed
          if (streakResult.status === 'freeze_used' && typeof streakResult.freezesUsed === 'number' && streakResult.freezesUsed > 0) {
            newPerformanceLog = rollUpFreezeUsageToLog(newPerformanceLog, streakResult.freezesUsed, today);
          }
          
          if (streakResult.status === 'freeze_used' || streakResult.status === 'streak_maintained') {
            // Increment streak for today's lesson (either consecutive or gap covered by freeze)
            newCurrentStreak += 1;
          } else {
            // Reset scenarios: streak_lost, gap_too_large, or no_previous_activity
            newCurrentStreak = 1;
          }
        }
        
        // Update last activity date to today
        newLastActivityDate = today;
      }

      set({
        totalXp: newTotalXp,
        currentStreak: newCurrentStreak,
        lastActivityDate: newLastActivityDate,
        lifetimeLessonsCompleted: newLifetimeLessonsCompleted,
        lifetimeAccuracyTotal: newLifetimeAccuracyTotal,
        lifetimeAccuracyCount: newLifetimeAccuracyCount,
        performanceLog: newPerformanceLog,
        dailyPlan: {
          ...dailyPlan,
          lessons: newLessonsArray,
          completedLessons: newCompletedLessonsCount,
        },
      });
    },

    setStreakNotificationLastShown: (date: string) => set({ streakNotificationLastShown: date }),

    generateDailyPlan: async (forceRegenerate = false) => {
      const { dailyPlan } = get();
      const today = getTodayDateString();
      
      // Check if we need to regenerate the plan
      const needsRegeneration = forceRegenerate || 
        !dailyPlan || 
        dailyPlan.date.split('T')[0] !== today;
      
      if (!needsRegeneration) {
        console.log('Daily plan is current, no regeneration needed');
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const { languageLevel, nativeLanguage, targetLanguage, learningGoal, timeCommitment, learningStyle } = useOnboardingStore.getState();
        const { currentStreak, totalXp, lastActivityDate } = get();
         // Centralized orchestration via Planning Service
        const onboardingPayload = { languageLevel, nativeLanguage, learningGoal, timeCommitment, learningStyle, targetLanguage };
        
        // Calculate user performance metrics via memoized store getter
        const performanceMetrics = get().getPerformanceMetrics();
        const spacedRepetitionData = get().getSpacedRepetitionNeeds();

        // Build AI prompt with centralized builder
        const prompt = buildDailyPlanPrompt({
          targetLanguage: targetLanguage,
          languageLevel: languageLevel,
          nativeLanguage: nativeLanguage,
          learningGoal: learningGoal,
          timeCommitment,
          learningStyle: learningStyle,
          todayDate: today,
          currentStreak,
          totalXp,
          lastActivityDate,
          performanceMetrics,
          spacedRepetitionData,
        });

        console.log('Sending enhanced prompt to AI Service:', prompt);
        
        const plan = await generateDailyPlanWithFallback(
          prompt,
          onboardingPayload,
          performanceMetrics,
          spacedRepetitionData,
          today
        );
        // Increment lifetime lessonsSeen once per new day
        const { lastCountedPlanDate, lifetimeLessonsSeen, lifetimeLessonTypeStats } = get();
        const planDay = today; // getTodayDateString returns YYYY-MM-DD
        const shouldCountToday = lastCountedPlanDate !== planDay;
        // Prepare updated lifetime per-type totals, counting once per new day
        let updatedTypeStats = { ...(lifetimeLessonTypeStats || createDefaultLessonTypeStats()) };
        if (shouldCountToday && Array.isArray(plan.lessons)) {
          plan.lessons.forEach((lesson) => {
            const lt = lesson.type;
            if (!updatedTypeStats[lt]) {
              updatedTypeStats[lt] = { total: 0, completed: 0, accuracyTotal: 0, accuracyCount: 0 };
            }
            updatedTypeStats[lt].total += 1;
          });
        }
        const prevLog = get().performanceLog || {};
        const updatedLog = rollUpGeneratedPlanToLog(prevLog, plan);
        set({
          dailyPlan: plan,
          isLoading: false,
          lifetimeLessonsSeen: shouldCountToday ? (lifetimeLessonsSeen + (plan.lessons?.length || 0)) : lifetimeLessonsSeen,
          lastCountedPlanDate: shouldCountToday ? planDay : lastCountedPlanDate,
          lifetimeLessonTypeStats: updatedTypeStats,
          performanceLog: updatedLog,
        });
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
                  nativeWords: [],
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
              case 'vocabulary':
                sessionState = {
                  words: [],
                  currentWordIndex: 0,
                  attempts: 0,
                  maxAttempts: 3,
                  lessonCompleted: false,
                  userRecordings: [],
                  aiScores: [],
                  feedback: null,
                  showFeedback: false,
                  pronunciationAccuracy: 0,
                  totalWords: 0,
                  failedWords: [],
                  skippedWords: [],
                  successWords: [],
                  completedWords: [],
                  isRetryingWord: false,
                  isRetryingSkippedWord: false,
                  // Word-level tracking for limits
                  wordRetryCount: {},
                  wordSkipCount: {},
                  maxRetries: 1,
                  maxSkips: 1,
                  // Word-level timing
                  wordTimers: [],
                  currentWordStartTime: null,
                  currentWordElapsedTime: 0,
                  totalSessionTime: 0,
                  isPaused: false,
                  pauseStartTime: null,
                  totalPauseTime: 0,
                  pauseCount: 0,
                  currentTimeBonusXP: 0,
                } as VocabularyState;
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
              nativeWords: [],
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

    setNativeWords: (lessonId: string, words: NativeWord[]) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              nativeWords: words,
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

    setSelectedPair: (lessonId: string, pair: { index: number, column: 'native' | 'translation' } | null) => set((state) => {
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

    setIncorrectPair: (lessonId: string, pair: { native: number; translation: number } | null) => set((state) => {
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

    addErrorDetail: (lessonId: string, nativeWord: string, attemptedTranslation: string, setIndex: number, correctTranslation: string, targetSound?: string) => set((state) => {
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
                    nativeWord,
                    attemptedTranslation,
                    timestamp: Date.now(),
                    setIndex,
                    correctTranslation,
                    targetSound,
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
      const { dailyPlan } = get();
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

    // Vocabulary-specific actions implementation
    getVocabularyState: (lessonId: string) => {
      const { dailyPlan } = get();
      if (!dailyPlan) return null;

      const lesson = dailyPlan.lessons.find(l => l.id === lessonId);
      return lesson?.sessionState as VocabularyState || null;
    },

    setVocabularyWords: (lessonId: string, words: VocabularyWord[]) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              words,
              totalWords: words.length,
            } as VocabularyState,
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

    setCurrentWordIndex: (lessonId: string, index: number) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              currentWordIndex: index,
            } as VocabularyState,
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

    incrementVocabularyAttempts: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              attempts: currentState.attempts + 1,
            } as VocabularyState,
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

    resetVocabularyAttempts: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              attempts: 0,
              isRetryingSkippedWord: false, // Reset when moving to next word
            } as VocabularyState,
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

    setVocabularyCompleted: (lessonId: string, completed: boolean) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              lessonCompleted: completed,
              isRetryingWord: false, // Reset retry flag when lesson is completed
              isRetryingSkippedWord: false, // Reset skipped retry flag when lesson is completed
            } as VocabularyState,
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

    addUserRecording: (lessonId: string, recording: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              userRecordings: [...currentState.userRecordings, recording],
            } as VocabularyState,
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

    addAIScore: (lessonId: string, score: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let pronToAdd: string | null = null;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          const wordIdx = currentState.currentWordIndex;
          const targetSound = currentState.words?.[wordIdx]?.targetSound;

          // If low score, append the pronunciation target for review
          if (score < 70 && targetSound) {
            pronToAdd = `/${targetSound}/`;
          }

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              aiScores: [...currentState.aiScores, score],
            } as VocabularyState,
          };
        }
        return lesson;
      });

      // Update performance log with pronunciation item when applicable
      let nextPerformanceLog = state.performanceLog;
      if (pronToAdd) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const entry = nextPerformanceLog[dateKey]
          ? { ...nextPerformanceLog[dateKey], byType: { ...nextPerformanceLog[dateKey].byType } }
          : initPerformanceLogEntry();
        const pronSet = new Set([...(entry.pronunciationReviewItems || []), pronToAdd]);
        entry.pronunciationReviewItems = Array.from(pronSet);
        nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: entry };
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),

    setFeedback: (lessonId: string, feedback: string | null) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              feedback,
            } as VocabularyState,
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

    setShowFeedback: (lessonId: string, show: boolean) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              showFeedback: show,
            } as VocabularyState,
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


    // Vocabulary timer methods
    startWordTimer: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              currentWordStartTime: Date.now(),
              currentWordElapsedTime: 0,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: 0, // Reset for new word
              pauseCount: 0, // Reset for new word
              attempts: 0, // Reset attempts for new word
            } as VocabularyState,
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

    stopWordTimer: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          if (currentState.currentWordStartTime) {
            // If paused, add current pause duration to total pause time
            let totalPauseTime = currentState.totalPauseTime || 0;
            if (currentState.isPaused && currentState.pauseStartTime) {
              totalPauseTime += Math.floor((Date.now() - currentState.pauseStartTime) / 1000);
            }

            const completionTime = Math.floor((Date.now() - currentState.currentWordStartTime - totalPauseTime * 1000) / 1000);
            const newWordTimers = [...currentState.wordTimers];
            // Add to existing time if this word was retried, otherwise set the time
            const existingTime = newWordTimers[currentState.currentWordIndex] || 0;
            newWordTimers[currentState.currentWordIndex] = existingTime + completionTime;

            // Calculate total session time by summing all word timers
            const totalSessionTime = newWordTimers.reduce((sum, time) => sum + (time || 0), 0);

            return {
              ...lesson,
              sessionState: {
                ...currentState,
                wordTimers: newWordTimers,
                currentWordStartTime: null,
                currentWordElapsedTime: completionTime,
                totalSessionTime: totalSessionTime,
                isPaused: false,
                pauseStartTime: null,
                totalPauseTime: 0, // Reset after word completion
                pauseCount: 0, // Reset after word completion
              } as VocabularyState,
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

    updateCurrentWordElapsedTime: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          if (currentState.currentWordStartTime && !currentState.isPaused) {
            const elapsedTime = Math.floor((Date.now() - currentState.currentWordStartTime - (currentState.totalPauseTime || 0) * 1000) / 1000);
            return {
              ...lesson,
              sessionState: {
                ...currentState,
                currentWordElapsedTime: elapsedTime,
              } as VocabularyState,
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

    pauseWordTimer: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          if (currentState.currentWordStartTime && !currentState.isPaused) {
            return {
              ...lesson,
              sessionState: {
                ...currentState,
                isPaused: true,
                pauseStartTime: Date.now(),
                pauseCount: currentState.pauseCount + 1,
              } as VocabularyState,
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

    resumeWordTimer: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          if (currentState.isPaused && currentState.pauseStartTime) {
            const pauseDuration = Math.floor((Date.now() - currentState.pauseStartTime) / 1000);
            return {
              ...lesson,
              sessionState: {
                ...currentState,
                isPaused: false,
                pauseStartTime: null,
                totalPauseTime: (currentState.totalPauseTime || 0) + pauseDuration,
              } as VocabularyState,
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

    resetVocabularyTimers: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          return {
            ...lesson,
            sessionState: {
              ...currentState,
              wordTimers: [],
              currentWordStartTime: null,
              currentWordElapsedTime: 0,
              totalSessionTime: 0,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: 0,
              pauseCount: 0,
            } as VocabularyState,
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

    resetVocabularyLesson: (lessonId: string) => set((state) => {
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
            sessionState: {
              words: [],
              currentWordIndex: 0,
              attempts: 0,
              maxAttempts: 3,
              lessonCompleted: false,
              userRecordings: [],
              aiScores: [],
              feedback: null,
              showFeedback: false,
              pronunciationAccuracy: 0,
              totalWords: 0,
              failedWords: [],
              skippedWords: [],
              successWords: [],
              isRetryingWord: false,
              isRetryingSkippedWord: false,
              // Word-level tracking for limits
              wordRetryCount: {},
              wordSkipCount: {},
              maxRetries: 1,
              maxSkips: 1,
              // Completed words tracking
              completedWords: [],
              // Word-level timing
              wordTimers: [],
              currentWordStartTime: null,
              currentWordElapsedTime: 0,
              totalSessionTime: 0,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: 0,
              pauseCount: 0,
              currentTimeBonusXP: 0,
            } as VocabularyState,
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

    clearWordTimer: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          const newWordTimers = [...currentState.wordTimers];
          delete newWordTimers[wordIndex]; // Remove the timer for this specific word

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              wordTimers: newWordTimers,
            } as VocabularyState,
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

    addVocabularyWordXP: (lessonId: string, wordXP: number) => {
      const { dailyPlan } = get();
      if (!dailyPlan) return;

      console.log(`[addVocabularyWordXP] Adding ${wordXP}XP to lesson ${lessonId}`);

      const updatedLessons = dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId) {
          const newLessonXP = lesson.xpReward + wordXP;

          console.log(`[addVocabularyWordXP] Lesson ${lessonId}: oldTotal=${lesson.xpReward}, newTotal=${newLessonXP}`);

          return {
            ...lesson,
            xpReward: newLessonXP,
          };
        }
        return lesson;
      });

      set({
        dailyPlan: {
          ...dailyPlan,
          lessons: updatedLessons,
        },
      });
    },

    updateVocabularyState: (lessonId: string, updatedState: Partial<VocabularyState>) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          return {
            ...lesson,
            sessionState: {
              ...lesson.sessionState,
              ...updatedState,
            } as VocabularyState,
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

    resumeWordTimerFromElapsed: (lessonId: string) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;

          // Calculate the adjusted start time based on current elapsed time
          const currentElapsed = currentState.currentWordElapsedTime || 0;
          const totalPauseTime = currentState.totalPauseTime || 0;
          const adjustedStartTime = Date.now() - (currentElapsed * 1000) - (totalPauseTime * 1000);

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              currentWordStartTime: adjustedStartTime,
              isPaused: false,
              pauseStartTime: null,
            } as VocabularyState,
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

    calculateWordXP: (lessonId: string, wordIndex: number, aiScore: number, currentAttempt?: number, wordDifficulty?: 'easy' | 'medium' | 'hard') => {
      const { dailyPlan } = get();
      if (!dailyPlan) return 0;

      const lesson = dailyPlan.lessons.find(l => l.id === lessonId);
      if (!lesson?.sessionState) return 0;

      const vocabularyState = lesson.sessionState as VocabularyState;
      const wordTimer = vocabularyState.wordTimers[wordIndex];

      // Check if this word was previously skipped (either currently in skippedWords or being retried from skip)
      const wasSkipped = vocabularyState.skippedWords.includes(wordIndex) || vocabularyState.isRetryingSkippedWord;

      // Base XP from AI score (0-100 maps to 0-50 XP)
      const baseXP = Math.floor(aiScore / 2);

      // Time bonus calculation - skipped words don't get time bonuses
      let timeBonus = 0;
      if (!wasSkipped) {
        if (wordTimer <= 10) {
          timeBonus = 20;
        } else if (wordTimer <= 20) {
          timeBonus = Math.floor(20 - (wordTimer - 10));
        } else if (wordTimer <= 40) {
          timeBonus = Math.floor(10 - ((wordTimer - 20) / 2));
        } else {
          timeBonus = 0;
        }
      }

      // Attempt-based multiplier (rewards first attempts more)
      // Skipped words get reduced multiplier since they had a previous chance
      const attemptMultipliers = wasSkipped
        ? [0.6, 0.5, 0.4] // Reduced multipliers for skipped words
        : [1.0, 0.8, 0.6]; // Normal multipliers for first-time attempts
      const attemptIndex = Math.min((currentAttempt || 1) - 1, 2);
      const attemptMultiplier = attemptMultipliers[attemptIndex];

      // Difficulty-based scaling
      const difficultyMultipliers = { easy: 0.8, medium: 1.0, hard: 1.3 };
      const difficultyMultiplier = difficultyMultipliers[wordDifficulty || 'medium'];

      // Calculate final XP with all multipliers
      const totalXP = Math.floor((baseXP + timeBonus) * attemptMultiplier * difficultyMultiplier);

      return totalXP;
    },

    addFailedWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let vocabItemToAdd: string | null = null;
      let pronItemToAdd: string | null = null;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          const failedWords = [...currentState.failedWords];
          const skippedWords = [...currentState.skippedWords];

          // Add word index if not already in the incomplete list
          if (!failedWords.includes(wordIndex)) {
            failedWords.push(wordIndex);
          }

          // Remove from skipped words to prevent duplication
          const cleanedSkippedWords = skippedWords.filter(index => index !== wordIndex);

          // Prepare review items for log
          const wordObj = currentState.words?.[wordIndex];
          if (wordObj?.word) {
            vocabItemToAdd = wordObj.word;
          }
          if (wordObj?.targetSound) {
            pronItemToAdd = `/${wordObj.targetSound}/`;
          }

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              failedWords,
              skippedWords: cleanedSkippedWords,
            } as VocabularyState,
          };
        }
        return lesson;
      });

      // Append review items to today's performance log
      let nextPerformanceLog = state.performanceLog;
      if (vocabItemToAdd || pronItemToAdd) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const entry = nextPerformanceLog[dateKey]
          ? { ...nextPerformanceLog[dateKey], byType: { ...nextPerformanceLog[dateKey].byType } }
          : initPerformanceLogEntry();
        if (vocabItemToAdd) {
          const vocabSet = new Set([...(entry.vocabularyReviewItems || []), vocabItemToAdd]);
          entry.vocabularyReviewItems = Array.from(vocabSet);
        }
        if (pronItemToAdd) {
          const pronSet = new Set([...(entry.pronunciationReviewItems || []), pronItemToAdd]);
          entry.pronunciationReviewItems = Array.from(pronSet);
        }
        nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: entry };
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),
    addSuccessWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              successWords: [...currentState.successWords, wordIndex],
            } as VocabularyState,
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
    addSkippedWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let vocabItemToAdd: string | null = null;
      let pronItemToAdd: string | null = null;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;

          // Check if word has reached skip limit
          const currentSkipCount = currentState.wordSkipCount[wordIndex] || 0;
          if (currentSkipCount >= currentState.maxSkips) {
            return lesson; // Don't allow skip if limit reached
          }

          const skippedWords = [...(currentState.skippedWords || [])];
          const failedWords = [...(currentState.failedWords || [])];

          // Update skip count for this word
          const updatedSkipCount = {
            ...currentState.wordSkipCount,
            [wordIndex]: currentSkipCount + 1
          };

          // Add word index if not already in the skipped list
          if (!skippedWords.includes(wordIndex)) {
            skippedWords.push(wordIndex);
            const wordObj = currentState.words?.[wordIndex];
            if (wordObj?.word) {
              vocabItemToAdd = wordObj.word;
            }
            if (wordObj?.targetSound) {
              pronItemToAdd = `/${wordObj.targetSound}/`;
            }
          }

          // Remove from incomplete words to prevent duplication
          const cleanedfailedWords = failedWords.filter(index => index !== wordIndex);

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              skippedWords,
              failedWords: cleanedfailedWords,
              wordSkipCount: updatedSkipCount,
            } as VocabularyState,
          };
        }
        return lesson;
      });

      // Append review items to today's performance log
      let nextPerformanceLog = state.performanceLog;
      if (vocabItemToAdd || pronItemToAdd) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const entry = nextPerformanceLog[dateKey]
          ? { ...nextPerformanceLog[dateKey], byType: { ...nextPerformanceLog[dateKey].byType } }
          : initPerformanceLogEntry();
        if (vocabItemToAdd) {
          const vocabSet = new Set([...(entry.vocabularyReviewItems || []), vocabItemToAdd]);
          entry.vocabularyReviewItems = Array.from(vocabSet);
        }
        if (pronItemToAdd) {
          const pronSet = new Set([...(entry.pronunciationReviewItems || []), pronItemToAdd]);
          entry.pronunciationReviewItems = Array.from(pronSet);
        }
        nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: entry };
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),

    retryIncompleteWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let vocabItemToRemove: string | null = null;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;

          // Check retry limit before allowing retry
          const currentRetryCount = currentState.wordRetryCount[wordIndex] || 0;
          if (currentRetryCount >= currentState.maxRetries) {
            return lesson; // Don't allow retry if limit reached
          }

          // Check if this word was originally skipped
          const wasSkipped = currentState.skippedWords.includes(wordIndex);

          // Increment retry count for this word
          const updatedRetryCount = { ...currentState.wordRetryCount };
          updatedRetryCount[wordIndex] = currentRetryCount + 1;

          // Remove the word from both incomplete and skipped lists to prevent duplication
          const failedWords = currentState.failedWords.filter(index => index !== wordIndex);
          const skippedWords = currentState.skippedWords.filter(index => index !== wordIndex);

          // Prepare log removal for this word
          const wordObj = currentState.words?.[wordIndex];
          if (wordObj?.word) {
            vocabItemToRemove = wordObj.word;
          }

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              currentWordIndex: wordIndex,
              attempts: 0,
              feedback: null,
              showFeedback: false,
              lessonCompleted: false,
              isRetryingWord: true,
              isRetryingSkippedWord: wasSkipped, // Track if this was originally a skipped word
              // Remove word from both lists when retrying
              failedWords,
              skippedWords,
              // Update retry count
              wordRetryCount: updatedRetryCount,
              // Reset timer state for the word - currentWordElapsedTime starts from 0
              currentWordStartTime: null,
              currentWordElapsedTime: 0,
              isPaused: false,
              pauseStartTime: null,
              totalPauseTime: 0,
              pauseCount: 0,
            } as VocabularyState,
          };
        }
        return lesson;
      });

      // Remove vocabulary item from today's performance log
      let nextPerformanceLog = state.performanceLog;
      if (vocabItemToRemove) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const existing = nextPerformanceLog[dateKey];
        if (existing) {
          const updatedEntry = {
            ...existing,
            vocabularyReviewItems: (existing.vocabularyReviewItems || []).filter(v => v !== vocabItemToRemove),
          };
          nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: updatedEntry };
        }
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),

    removeIncompleteWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let vocabItemToRemove: string | null = null;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          const failedWords = currentState.failedWords.filter(index => index !== wordIndex);

          const wordObj = currentState.words?.[wordIndex];
          if (wordObj?.word) {
            vocabItemToRemove = wordObj.word;
          }

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              failedWords,
            } as VocabularyState,
          };
        }
        return lesson;
      });

      // Remove vocabulary item from today's performance log
      let nextPerformanceLog = state.performanceLog;
      if (vocabItemToRemove) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const existing = nextPerformanceLog[dateKey];
        if (existing) {
          const updatedEntry = {
            ...existing,
            vocabularyReviewItems: (existing.vocabularyReviewItems || []).filter(v => v !== vocabItemToRemove),
          };
          nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: updatedEntry };
        }
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),

    removeSkippedWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let vocabItemToRemove: string | null = null;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;
          const skippedWords = currentState.skippedWords.filter(index => index !== wordIndex);

          const wordObj = currentState.words?.[wordIndex];
          if (wordObj?.word) {
            vocabItemToRemove = wordObj.word;
          }

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              skippedWords,
            } as VocabularyState,
          };
        }
        return lesson;
      });

      // Remove vocabulary item from today's performance log
      let nextPerformanceLog = state.performanceLog;
      if (vocabItemToRemove) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const existing = nextPerformanceLog[dateKey];
        if (existing) {
          const updatedEntry = {
            ...existing,
            vocabularyReviewItems: (existing.vocabularyReviewItems || []).filter(v => v !== vocabItemToRemove),
          };
          nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: updatedEntry };
        }
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),

    moveSkippedToIncomplete: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState) {
          const currentState = lesson.sessionState as VocabularyState;

          // Remove from skipped words
          const skippedWords = currentState.skippedWords.filter(index => index !== wordIndex);

          // Add to incomplete words if not already there
          const failedWords = [...currentState.failedWords];
          if (!failedWords.includes(wordIndex)) {
            failedWords.push(wordIndex);
          }

          return {
            ...lesson,
            sessionState: {
              ...currentState,
              skippedWords,
              failedWords,
            } as VocabularyState,
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

    addCompletedWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      let wordNewlyCompleted = false;
      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState && 'completedWords' in lesson.sessionState) {
          const vocabularyState = lesson.sessionState as VocabularyState;
          if (!vocabularyState.completedWords.includes(wordIndex)) {
            wordNewlyCompleted = true;
            return {
              ...lesson,
              sessionState: {
                ...vocabularyState,
                completedWords: [...vocabularyState.completedWords, wordIndex]
              }
            };
          }
        }
        return lesson;
      });

      // Micro-activity: increment in-lesson events for newly completed vocabulary word
      let nextPerformanceLog = state.performanceLog;
      if (wordNewlyCompleted) {
        const dateKey = getDateKey(state.dailyPlan.date);
        const existingEntry = nextPerformanceLog[dateKey];
        const entry = existingEntry
          ? { ...existingEntry, byType: { ...existingEntry.byType } }
          : initPerformanceLogEntry();
        // Treat in-lesson activity as a boolean (0/1) instead of an unbounded counter
        entry.inLessonEvents = 1;
        nextPerformanceLog = { ...nextPerformanceLog, [dateKey]: entry };
      }

      return {
        ...state,
        dailyPlan: {
          ...state.dailyPlan,
          lessons: updatedLessons,
        },
        performanceLog: nextPerformanceLog,
      };
    }),

    removeCompletedWord: (lessonId: string, wordIndex: number) => set((state) => {
      if (!state.dailyPlan) return state;

      const updatedLessons = state.dailyPlan.lessons.map(lesson => {
        if (lesson.id === lessonId && lesson.sessionState && 'completedWords' in lesson.sessionState) {
          const vocabularyState = lesson.sessionState as VocabularyState;
          return {
            ...lesson,
            sessionState: {
              ...vocabularyState,
              completedWords: vocabularyState.completedWords.filter(index => index !== wordIndex)
            }
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

    getLesson: (lessonId: string) => {
      const { dailyPlan } = get();
      if (!dailyPlan) return null;

      return dailyPlan.lessons.find(lesson => lesson.id === lessonId) || null;
    },

    getPerformanceMetrics: () => {
      const state = get();
      // Prefer daily snapshot when available; lifetime-only remains stable fallback.
      const lifetime = calculateUserPerformanceMetrics({
        dailyPlan: state.dailyPlan,
        lifetimeLessonsSeen: state.lifetimeLessonsSeen,
        lifetimeLessonsCompleted: state.lifetimeLessonsCompleted,
        lifetimeAccuracyTotal: state.lifetimeAccuracyTotal,
        lifetimeAccuracyCount: state.lifetimeAccuracyCount,
        lifetimeLessonTypeStats: state.lifetimeLessonTypeStats,
      });
      const daily = calculatePerformanceSnapshot(state.performanceLog, state.dailyPlan?.date ?? getTodayDateString());
      return selectEffectivePerformanceMetrics({ daily, lifetime });
    },

    getSpacedRepetitionNeeds: () => {
      const state = get();
      return calculateSpacedRepetitionNeeds({
        dailyPlan: state.dailyPlan,
        lifetimeAccuracyTotal: state.lifetimeAccuracyTotal,
        lifetimeAccuracyCount: state.lifetimeAccuracyCount,
        lifetimeLessonsSeen: state.lifetimeLessonsSeen,
        lifetimeLessonsCompleted: state.lifetimeLessonsCompleted,
        performanceLog: state.performanceLog,
      });
    },

    // Streak freeze functions
    purchaseStreakFreeze: () => {
      const { totalXp, streakFreezes, maxStreakFreezes } = get();
      const FREEZE_COST = 100; // Cost in XP to purchase a streak freeze
      
      if (totalXp < FREEZE_COST) return false; // Not enough XP
      if (streakFreezes >= maxStreakFreezes) return false; // Already at max capacity
      
      set({
        totalXp: totalXp - FREEZE_COST,
        streakFreezes: streakFreezes + 1
      });
      return true;
    },

    checkDailyGoalMet: () => {
      const { dailyPlan, lastActivityDate } = get();
      if (!dailyPlan) return false;
      
      const today = getTodayDateString();
      
      // Daily goal is met only if:
      // 1. At least one lesson is completed in the daily plan
      // 2. The user has completed at least one lesson TODAY
      return dailyPlan.completedLessons > 0 && lastActivityDate === today;
    },

    useStreakFreeze: () => {
      const { streakFreezes } = get();
      if (streakFreezes <= 0) return false;
      
      set({ streakFreezes: streakFreezes - 1 });
      return true;
    },

    validateDailyStreak: () => {
      const { lastActivityDate, currentStreak, streakFreezes, lastValidationDate } = get();
      const today = getTodayDateString();

      // If validation has already run today, don't re-evaluate.
      if (lastValidationDate === today) {
        return { status: 'streak_maintained' };
      }

      // If no previous activity, this is the first lesson - start fresh
      if (!lastActivityDate) {
        set({ lastValidationDate: today }); // Mark validation as run for today
        return { status: 'no_previous_activity' };
      }

      // Check if there's a gap between last activity and today
      if (!areConsecutiveDays(lastActivityDate, today)) {
        // Calculate the gap size
        const gapDays = calculateGapDays(lastActivityDate, today);

        // Check if gap can be covered by available freezes
        if (canCoverGap(gapDays, streakFreezes)) {
          // Calculate how many freezes are needed
          const freezesNeeded = calculateFreezesNeeded(gapDays);
          const newFreezeCount = streakFreezes - freezesNeeded;

          set({
            streakFreezes: newFreezeCount,
            lastValidationDate: today, // Mark validation as run
          });

          return {
            status: 'freeze_used',
            streakProtected: currentStreak,
            freezesRemaining: newFreezeCount,
            gapDays,
            freezesUsed: freezesNeeded,
          };
        } else if (gapDays > 9) {
          // Gap is too large to be covered (more than 9 days)
          set({ currentStreak: 0, lastValidationDate: today });
          return {
            status: 'gap_too_large',
            lostStreak: currentStreak,
            gapDays,
          };
        } else {
          // Not enough freezes available - reset streak
          set({ currentStreak: 0, lastValidationDate: today });
          return {
            status: 'streak_lost',
            lostStreak: currentStreak,
            gapDays,
          };
        }
      }

      // No gap detected - streak is maintained
      set({ lastValidationDate: today });
      return { status: 'streak_maintained' };
    },

    // Content generation methods
    generateVocabularyContent: async (
      lessonId: string
    ): Promise<VocabularyWord[]> => {
      // Compute performance metrics and spaced-repetition needs; caching is handled by React Query
      const performanceMetrics = get().getPerformanceMetrics();
      const spacedRepetitionData = get().getSpacedRepetitionNeeds();

      try {
        // Get user onboarding data for personalization
        const onboardingData = useOnboardingStore.getState();

        // Generate content using AI service
        const generatedContent = await aiService.generateVocabularyWords(
          onboardingData.targetLanguage || 'italian',
          onboardingData.nativeLanguage || 'english',
          onboardingData.languageLevel || 'beginner',
          onboardingData.learningGoal || 'pronunciation',
          20, // Increased default count for a more engaging session
          performanceMetrics,
          spacedRepetitionData
        );

        // Return directly; React Query caches based on its queryKey
        return generatedContent;
      } catch (error) {
        console.error('Failed to generate vocabulary content:', error);
        return [];
      }
    },

    generateWordPairsContent: async (lessonId: string): Promise<Record<string, WordPair[]>> => {
      // Compute performance metrics and spaced-repetition needs; caching is handled by React Query
      const performanceMetrics = get().getPerformanceMetrics();
      const spacedRepetitionData = get().getSpacedRepetitionNeeds();

      try {
        // Get user onboarding data for personalization
        const onboardingData = useOnboardingStore.getState();

        // Generate content using AI service with new structure
        const generatedContent = await aiService.generateWordPairs(
          onboardingData.targetLanguage || 'italian',
          onboardingData.nativeLanguage || 'english',
          onboardingData.languageLevel || 'beginner',
          onboardingData.learningGoal || 'pronunciation',
          10, // Generate 10 sets
          8,   // 8 pairs per set
          performanceMetrics,
          spacedRepetitionData
        );

        // Return directly; React Query caches based on its queryKey
        return generatedContent;
      } catch (error) {
        console.error('Failed to generate word pairs content:', error);
        return {};
      }
    },

    // Removed legacy store-level caching helpers; React Query persists and indexes content
  }),
  {
    name: 'lesson-storage',
    storage: createJSONStorage(() => createMMKVStorage(userDataStorage)),
  }));