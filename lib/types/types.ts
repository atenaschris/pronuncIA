import { WORD_PAIRS } from "../constants/constants";

// Define types based on the WORD_PAIRS constant structure
export type WordPair = typeof WORD_PAIRS[number];
export type EnglishWord = WordPair['english'];
export type TranslationWord = WordPair['translation'];
export type ColumnType = 'english' | 'translation';