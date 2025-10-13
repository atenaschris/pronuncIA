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

// Heuristic phoneme inference from a word string.
// Currently tailored for English; other languages return generic labels.
export function inferSoundFromWord(
  word: string,
  lang: string = 'en'
): { soundType: 'consonant' | 'vowel' | 'mixed'; targetSound: string } {
  const lower = (word || '').toLowerCase();
  if (lang !== 'en') {
    return { soundType: 'mixed', targetSound: 'general' };
  }

  const rules: Array<{ regex: RegExp; soundType: 'consonant' | 'vowel'; targetSound: string }> = [
    // Common consonants
    { regex: /th/, soundType: 'consonant', targetSound: 'θ' },
    { regex: /\br/, soundType: 'consonant', targetSound: 'r' },
    { regex: /\bl/, soundType: 'consonant', targetSound: 'l' },
    // Diphthongs
    { regex: /oi/, soundType: 'vowel', targetSound: 'ɔɪ' },
    { regex: /(ow|ou)/, soundType: 'vowel', targetSound: 'aʊ' },
    { regex: /(ay|ai|ey|ei)/, soundType: 'vowel', targetSound: 'aɪ' },
    // Long vowels
    { regex: /(ee|ea)/, soundType: 'vowel', targetSound: 'iː' },
    { regex: /ar/, soundType: 'vowel', targetSound: 'ɑː' },
    { regex: /oo/, soundType: 'vowel', targetSound: 'uː' },
    { regex: /or/, soundType: 'vowel', targetSound: 'ɔː' },
    { regex: /(ir|ur|er|ear)/, soundType: 'vowel', targetSound: 'ɜː' },
    // Short vowels (very rough heuristics)
    { regex: /a(?!i|y)/, soundType: 'vowel', targetSound: 'æ' },
    { regex: /e(?!i|y)/, soundType: 'vowel', targetSound: 'e' },
    { regex: /i(?!e)/, soundType: 'vowel', targetSound: 'ɪ' },
    { regex: /o(?!o|r|w)/, soundType: 'vowel', targetSound: 'ɒ' },
    { regex: /u(?!r)/, soundType: 'vowel', targetSound: 'ʌ' },
  ];

  for (const rule of rules) {
    if (rule.regex.test(lower)) {
      return { soundType: rule.soundType, targetSound: rule.targetSound };
    }
  }

  return { soundType: 'mixed', targetSound: 'general' };
}