import { VOCABULARY_WORD_SETS } from "../constants/constants";

// Map pronunciation tokens (e.g., '/θ/') to vocabulary set keys
export function mapPronunciationTokensToSetKeys(tokens: string[]): (keyof typeof VOCABULARY_WORD_SETS)[] {
  const pronToSetKey: Record<string, keyof typeof VOCABULARY_WORD_SETS> = {
    '/θ/': 'consonants_th',
    '/ð/': 'consonants_th',
    '/r/': 'consonants_r',
    '/l/': 'mixed_sounds',
  };
  return tokens
    .map((t) => pronToSetKey[t])
    .filter((k): k is keyof typeof VOCABULARY_WORD_SETS => !!k);
}

// Given a set key, return desired target phonemes for prioritization
export function desiredTargetSoundsForSetKey(key: keyof typeof VOCABULARY_WORD_SETS): Set<string> {
  const sounds = new Set<string>();
  if (key === 'consonants_th') {
    sounds.add('θ');
    sounds.add('ð');
  } else if (key === 'consonants_r') {
    sounds.add('r');
  }
  // mixed_sounds does not imply a single targetSound
  return sounds;
}