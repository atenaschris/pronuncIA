
import { WORD_PAIR_SETS } from '../constants/constants';

// Infer the type of a single set (e.g., set1, set2, etc.)
type WordPairSet = typeof WORD_PAIR_SETS[keyof typeof WORD_PAIR_SETS];

// Define a flexible WordPair type that allows any string values
export interface WordPair {
  native: string;
  translation: string;
}

// Keep the original constrained types for when we need them
export type PredefinedWordPair = WordPairSet[number];
export type NativeWord = string;
export type TranslationWord = string;
export type ColumnType = 'native' | 'translation';

export type FeedbackType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";

  // Word-pairs specific state
export interface WordPairsState {
  nativeWords: NativeWord[];
  translationWords: TranslationWord[];
  selectedPair: { index: number, column: 'native' | 'translation' } | null;
  matchedPairs: number[];
  score: number;
  incorrectPair: { native: number; translation: number } | null;
  lessonCompleted: boolean;
  currentSetIndex: number;
  isReplayingForErrors: boolean; // Tracks when replay button is clicked for error fixing
  errorDetails: {
    incorrectMatches: Array<{
      nativeWord: NativeWord;
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