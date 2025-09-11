// Vocabulary lesson interfaces
export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  audioUrl?: string;
  definition: string;
  example: string;
  difficulty: 'easy' | 'medium' | 'hard';
  soundType: 'consonant' | 'vowel' | 'mixed';
  targetSound: string; // The specific sound to focus on (e.g., 'th', 'r', 'æ')
}

export interface VocabularyState {
  words: VocabularyWord[];
  currentWordIndex: number;
  attempts: number;
  maxAttempts: number;
  lessonCompleted: boolean;
  userRecordings: string[]; // URLs or base64 of user recordings
  aiScores: number[]; // AI pronunciation scores for each word (0-100)
  feedback: string | null; // AI feedback text
  showFeedback: boolean;
  totalWords: number;
  failedWords: number[]; // Indices of words that exceeded max attempts and were skipped
  skippedWords: number[]; // Indices of words that were manually skipped by the user
  successWords: number[]; // Indices of words that were successfully pronounced
  isRetryingWord: boolean; // Flag to track if we're currently retrying an incomplete word
  isRetryingSkippedWord: boolean; // Flag to track if we're specifically retrying a previously skipped word
  // Word-level tracking for limits
  wordRetryCount: { [wordIndex: number]: number }; // Track retry count per word
  wordSkipCount: { [wordIndex: number]: number }; // Track skip count per word
  maxRetries: number; // Maximum retries allowed per word (default: 1)
  maxSkips: number; // Maximum skips allowed per word (default: 1)
  completedWords: number[]; // Array of word indices that have been completed (submitted to AI)
  // Word-level timing (similar to set timing in word-pairs)
  wordTimers: number[]; // Array of completion times for each word (in seconds)
  currentWordStartTime: number | null; // Timestamp when current word started
  currentWordElapsedTime: number; // Current elapsed time for the active word (in seconds)
  totalSessionTime: number; // Total time spent across all words in this session (in seconds)
  isPaused: boolean; // Whether the current word timer is paused
  pauseStartTime: number | null; // Timestamp when pause started
  totalPauseTime: number; // Total time spent paused in current word (in seconds)
  pauseCount: number; // Number of times user has paused in current word
  // Note: lesson.xpReward is the single source of truth for all XP tracking
}

export type KindOfWordFinalScreen = 'success' | 'failed' | 'skipped';