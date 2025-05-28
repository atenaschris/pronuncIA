
import { WORD_PAIR_SETS } from '../constants/constants';

// Infer the type of a single set (e.g., set1, set2, etc.)
type WordPairSet = typeof WORD_PAIR_SETS[keyof typeof WORD_PAIR_SETS];

// Infer the type of a single word pair object from one of the sets
export type WordPair = WordPairSet[number];
export type EnglishWord = WordPair['english'];
export type TranslationWord = WordPair['translation'];
export type ColumnType = 'english' | 'translation';

export type FeedbackType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";