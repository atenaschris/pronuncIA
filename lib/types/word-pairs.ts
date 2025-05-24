import { WORD_PAIRS } from "../constants/constants";

export type WordPair = typeof WORD_PAIRS[number];
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