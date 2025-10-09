import {
  ACCURACY_THRESHOLD,
  FALLBACK_WORD_PAIRS_POOLS,
  VOCABULARY_SET_KEYS,
  VOCABULARY_WORD_SETS,
  WORD_PAIR_SETS,
  WORD_PAIRS_SET_KEYS,
} from "../constants/constants";
import { desiredTargetSoundsForSetKey, mapPronunciationTokensToSetKeys } from "../helpers/sound-mapping-utils";
import { DailyPlan, LessonType } from "../store/lesson-store";
import { LanguageLevel, LearningGoal, NativeLanguageCode, TargetLanguageCode } from "../types/onboarding-types";
import { VocabularyWord } from "../types/vocabulary";
import { WordPair } from "../types/word-pairs";
import { getDailyPlanSystemPrompt, getVocabularyWordsSystemPrompt, getWordPairsSystemPrompt } from "./prompt-templates";

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AIServiceConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

class AIService {
  private config: AIServiceConfig;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    this.config = {
      apiKey,
      model: 'gpt-4-turbo-preview',
      maxTokens: 2000,
      temperature: 0.7,
    };
  }

  async generateDailyPlan(prompt: string): Promise<DailyPlan> {
    try {
      const messages: OpenAIMessage[] = [
        { role: 'system', content: getDailyPlanSystemPrompt() },
        { role: 'user', content: prompt }
      ];
      if (messages.length) {
        throw new Error('Trying the fallback intelligent fallback');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          // Force JSON-only response to reduce narration/formatting drift
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Parse the JSON response
      let parsedPlan: any;
      try {
        // Clean the content to remove potential markdown formatting
        let cleanContent = content.trim();

        // Remove markdown code blocks if present
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Remove any leading/trailing whitespace again
        cleanContent = cleanContent.trim();

        parsedPlan = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON. Raw content:', content);
        console.error('Parse error:', parseError);

        // Try to extract JSON from the content if it's wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            console.log('Attempting to parse extracted JSON:', jsonMatch[0]);
            parsedPlan = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error('Second parse attempt failed:', secondParseError);
            throw new Error(`Invalid JSON response from AI service. Raw response: ${content.substring(0, 500)}...`);
          }
        } else {
          throw new Error(`Invalid JSON response from AI service. Raw response: ${content.substring(0, 500)}...`);
        }
      }

      // Validate the response structure
      if (!this.validateDailyPlan(parsedPlan)) {
        throw new Error('AI response does not match expected DailyPlan structure');
      }

      return parsedPlan as DailyPlan;

    } catch (error) {
      console.error('AI Service Error:', error);

      // Re-throw the error so the lesson store can handle fallback with more intelligent logic
      throw error;
    }
  }

  private validateDailyPlan(plan: any): plan is DailyPlan {
    return (
      plan &&
      typeof plan.id === 'string' &&
      typeof plan.date === 'string' &&
      Array.isArray(plan.lessons) &&
      typeof plan.totalXp === 'number' &&
      typeof plan.completedLessons === 'number' &&
      plan.lessons.every((lesson: any) =>
        typeof lesson.id === 'string' &&
        typeof lesson.type === 'string' &&
        typeof lesson.title === 'string' &&
        typeof lesson.description === 'string' &&
        typeof lesson.xpReward === 'number' &&
        typeof lesson.rewardableXP === 'number' &&
        typeof lesson.completed === 'boolean' &&
        typeof lesson.locked === 'boolean'
      )
    );
  }



  // Generate personalized vocabulary words based on user preferences and performance data
  async generateVocabularyWords(
    targetLanguage: TargetLanguageCode,
    nativeLanguage: NativeLanguageCode,
    languageLevel: LanguageLevel,
    learningGoal: LearningGoal,
    count: number = 5,
    soundType?: 'consonant' | 'vowel' | 'mixed',
    targetSound?: string,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: LessonType[];
      strugglingAreas: LessonType[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    }
  ): Promise<VocabularyWord[]> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: getVocabularyWordsSystemPrompt(
            targetLanguage,
            nativeLanguage,
            languageLevel,
            learningGoal,
            count,
            soundType,
            targetSound,
            performanceMetrics,
            spacedRepetitionData
          )
        },
        {
          role: 'user',
          content: `Generate ${count} vocabulary words for ${targetLanguage} pronunciation practice.`
        }
      ];

      if (messages.length) {
        throw new Error('testing fallback generation couple words')
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Clean and parse the response with robust error handling
      let cleanedContent = content.trim();

      // Remove markdown formatting if present
      cleanedContent = cleanedContent.replace(/```json\s*/, '').replace(/```\s*$/, '');

      // Remove any leading/trailing whitespace
      cleanedContent = cleanedContent.trim();

      let vocabularyWords;
      try {
        vocabularyWords = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.warn('Initial JSON parse failed, attempting to extract JSON from content:', parseError);

        // Try to extract JSON array from the content
        const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            vocabularyWords = JSON.parse(jsonMatch[0]);
          } catch (extractError) {
            console.error('Failed to parse extracted JSON:', extractError);
            throw new Error(`Failed to parse AI response as JSON: ${extractError}`);
          }
        } else {
          console.error('No JSON array found in content:', cleanedContent);
          throw new Error('No valid JSON array found in AI response');
        }
      }

      if (!Array.isArray(vocabularyWords) || !this.validateVocabularyWords(vocabularyWords)) {
        throw new Error('Invalid vocabulary words format received from AI');
      }

      return vocabularyWords;
    } catch (error) {
      console.error('Error generating vocabulary words:', error);
      return this.getFallbackVocabularyWords(
        count,
        soundType,
        targetSound,
        performanceMetrics,
        spacedRepetitionData,
        languageLevel,
        learningGoal,
        targetLanguage,
        nativeLanguage
      );
    }
  }

  // Generate personalized word pairs based on user preferences and performance data
  async generateWordPairs(
    targetLanguage: TargetLanguageCode,
    nativeLanguage: NativeLanguageCode,
    languageLevel: LanguageLevel,
    learningGoal: LearningGoal,
    setsCount: number = 10,
    pairsPerSet: number = 8,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: LessonType[];
      strugglingAreas: LessonType[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    }
  ): Promise<Record<string, WordPair[]>> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: getWordPairsSystemPrompt(
            targetLanguage,
            nativeLanguage,
            languageLevel,
            learningGoal,
            setsCount,
            pairsPerSet,
            performanceMetrics,
            spacedRepetitionData
          )
        },
        {
          role: 'user',
          content: `Generate ${setsCount} sets of ${pairsPerSet} word pairs each for ${targetLanguage} to ${nativeLanguage} translation practice.`
        }
      ];

      if (messages.length) {
        throw new Error('testing fallback generatiing vocabulary')
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Parse the JSON response with robust error handling
      let wordPairsData: any;
      try {
        // Clean the content to remove potential markdown formatting
        let cleanContent = content.trim();

        // Remove markdown code blocks if present
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Remove any leading/trailing whitespace again
        cleanContent = cleanContent.trim();

        wordPairsData = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON. Raw content:', content);
        console.error('Parse error:', parseError);

        // Try to extract JSON from the content if it's wrapped in text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            console.log('Attempting to parse extracted JSON:', jsonMatch[0]);
            wordPairsData = JSON.parse(jsonMatch[0]);
          } catch (secondParseError) {
            console.error('Second parse attempt failed:', secondParseError);
            throw new Error(`Invalid JSON response from AI service. Raw response: ${content.substring(0, 500)}...`);
          }
        } else {
          throw new Error(`Invalid JSON response from AI service. Raw response: ${content.substring(0, 500)}...`);
        }
      }

      // Strictly validate schema shape and counts; no sanitization/mutation
      if (!this.validateWordPairsSets(wordPairsData) ||
          !this.validateWordPairsStructure(wordPairsData, setsCount, pairsPerSet)) {
        throw new Error('Invalid word pairs format received from AI');
      }

      return wordPairsData;
    } catch (error) {
      console.error('Error generating word pairs:', error);
      return this.getFallbackWordPairs(
        setsCount,
        pairsPerSet,
        targetLanguage,
        nativeLanguage,
        languageLevel,
        learningGoal,
        performanceMetrics,
        spacedRepetitionData
      );
    }
  }

  // Validation methods
  private validateVocabularyWords(words: any[]): words is VocabularyWord[] {
    return words.every(word =>
      typeof word.id === 'string' &&
      typeof word.word === 'string' &&
      typeof word.phonetic === 'string' &&
      typeof word.definition === 'string' &&
      typeof word.example === 'string' &&
      ['easy', 'medium', 'hard'].includes(word.difficulty) &&
      ['consonant', 'vowel', 'mixed'].includes(word.soundType) &&
      typeof word.targetSound === 'string'
    );
  }

  private validateWordPairs(pairs: any[]): pairs is WordPair[] {
    return pairs.every(pair =>
      typeof pair.native === 'string' &&
      typeof pair.translation === 'string'
    );
  }

  private validateWordPairsSets(data: any): data is Record<string, WordPair[]> {
    if (!data || typeof data !== 'object') return false;

    return Object.values(data).every(set =>
      Array.isArray(set) && this.validateWordPairs(set)
    );
  }

  // Enforce exact keys, counts, and single-token constraints without mutating content
  private validateWordPairsStructure(
    data: Record<string, WordPair[]>,
    setsCount: number,
    pairsPerSet: number
  ): boolean {
    const expectedKeys = Array.from({ length: setsCount }, (_, i) => `set${i + 1}`);
    const keys = Object.keys(data).sort();
    const expectedSorted = [...expectedKeys].sort();
    // Keys must match exactly set1..setN
    if (keys.length !== expectedSorted.length || keys.some((k, i) => k !== expectedSorted[i])) {
      return false;
    }

    // Each set must contain exactly pairsPerSet items; each item must be single-token strings
    const isSingleToken = (s: string) => {
      const t = (s || '').trim();
      return t.length > 0 && !/\s/.test(t);
    };

    for (const key of expectedKeys) {
      const set = data[key];
      if (!Array.isArray(set) || set.length !== pairsPerSet) return false;
      for (const p of set) {
        if (typeof p !== 'object' || p === null) return false;
        if (typeof p.native !== 'string' || typeof p.translation !== 'string') return false;
        if (!isSingleToken(p.native) || !isSingleToken(p.translation)) return false;
      }
    }

    return true;
  }

  // (Normalization removed for strict prompting approach)

  // Fallback methods
  private getFallbackVocabularyWords(
    count: number,
    soundType?: string,
    targetSound?: string,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: LessonType[];
      strugglingAreas: LessonType[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    },
    languageLevel?: LanguageLevel,
    learningGoal?: LearningGoal,
    targetLanguage?: TargetLanguageCode,
    nativeLanguage?: NativeLanguageCode
  ): VocabularyWord[] {
    // Build target-language words from language-specific pools when available
    const poolKey = targetLanguage && nativeLanguage ? `${targetLanguage}-${nativeLanguage}` : undefined;
    const languagePool = (poolKey && FALLBACK_WORD_PAIRS_POOLS[poolKey]) || FALLBACK_WORD_PAIRS_POOLS['en-it'] || [];

    // Onboarding-aware category indices (expanded to numeric indices)
    const pickIndicesForOnboarding = (lvl?: string, goal?: string): number[] => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { FALLBACK_LEXICON_CATEGORY_RANGES: ranges } = require('../constants/constants');

        const level = (lvl || '').toUpperCase();
        const base: (keyof typeof ranges)[] = [];
        if (level === 'A1') {
          base.push('core', 'numbers', 'colors');
        } else if (level === 'A2') {
          base.push('core', 'numbers', 'colors', 'animals', 'school');
        } else if (level === 'B1') {
          base.push('animals', 'school', 'health', 'shopping', 'travel');
        } else if (level === 'B2') {
          base.push('health', 'shopping', 'travel', 'work', 'exam', 'advanced');
        } else if (level === 'C1' || level === 'C2') {
          base.push('work', 'exam', 'travel', 'advanced');
        } else {
          base.push('core', 'numbers', 'colors', 'animals');
        }

        const gl = (goal || '').toLowerCase();
        let goalExtras: (keyof typeof ranges)[] = [];
        if (gl === 'travel') {
          goalExtras = ['travel', 'shopping', 'health'];
        } else if (gl === 'work') {
          goalExtras = ['work', 'school'];
        } else if (gl === 'exam') {
          goalExtras = ['exam', 'school'];
        } else if (gl === 'fluency') {
          goalExtras = ['numbers', 'colors', 'animals', 'school', 'health', 'shopping'];
        }

        const mergedKeys = Array.from(new Set<keyof typeof ranges>([...base, ...goalExtras]));
        const indices: number[] = [];
        mergedKeys.forEach((k) => {
          const { start, end } = ranges[k];
          for (let i = start; i <= end; i++) indices.push(i);
        });
        return indices;
      } catch {
        return [];
      }
    };

    const selectedIndices = pickIndicesForOnboarding(languageLevel, learningGoal);
    const levelUpper = (languageLevel || '').toUpperCase();

    let allWords: VocabularyWord[] = [];
    if (languagePool.length > 0) {
      const targetTokens = languagePool.map((p: WordPair) => p.native);
      const indicesToUse: number[] = selectedIndices.length > 0 ? selectedIndices : targetTokens.map((_, i) => i);

      // CEFR-aware lexical difficulty from category ranges
      const assignDifficulty = (index: number): 'easy' | 'medium' | 'hard' => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { FALLBACK_LEXICON_CATEGORY_RANGES: ranges } = require('../constants/constants');
          const getCategoryForIndex = (i: number): keyof typeof ranges | 'unknown' => {
            for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
              const { start, end } = ranges[key];
              if (i >= start && i <= end) return key;
            }
            return 'unknown';
          };

          const category = getCategoryForIndex(index);
          const easyCats: Array<keyof typeof ranges> = ['core', 'numbers', 'colors', 'animals'];
          const mediumCats: Array<keyof typeof ranges> = ['school', 'shopping', 'health', 'verbs', 'travel'];
          const hardCats: Array<keyof typeof ranges> = ['work', 'exam', 'advanced'];

          if (category !== 'unknown') {
            if (easyCats.includes(category)) return 'easy';
            if (mediumCats.includes(category)) return 'medium';
            if (hardCats.includes(category)) return 'hard';
          }
        } catch {
          // Fallback heuristic if ranges unavailable
          if (levelUpper === 'A1') return 'easy';
          if (levelUpper === 'A2') return index % 2 === 0 ? 'easy' : 'medium';
          if (levelUpper === 'B1') return 'medium';
          if (levelUpper === 'B2') return index % 3 === 0 ? 'hard' : 'medium';
          if (levelUpper === 'C1' || levelUpper === 'C2') return index % 2 === 0 ? 'hard' : 'medium';
        }
        return 'medium';
      };

      allWords = indicesToUse
        .filter((i) => i >= 0 && i < targetTokens.length)
        .map((i) => {
          const w = targetTokens[i];
          const id = `fb-${targetLanguage || 'en'}-${w}-${i}`;
          const diff = assignDifficulty(i);
          return {
            id,
            word: w,
            phonetic: '[n/a]',
            definition: `Common ${targetLanguage || 'target'} word`,
            example: `${w} — basic usage`,
            difficulty: diff,
            soundType: (soundType as 'consonant' | 'vowel' | 'mixed') || 'mixed',
            targetSound: targetSound || 'general',
          } as VocabularyWord;
        });
    }

    // If pools are unavailable, fallback to curated English-centric sets
    if (allWords.length === 0) {
      const preferredSetKeys: (keyof typeof VOCABULARY_WORD_SETS)[] = mapPronunciationTokensToSetKeys(
        spacedRepetitionData?.pronunciationReview || []
      );

      const pickGoalPreferredSetKeys = (goal?: string): (keyof typeof VOCABULARY_WORD_SETS)[] => {
        const gl = (goal || '').toLowerCase();
        if (gl === 'travel') {
          return ['mixed_sounds', 'vowels_short', 'vowels_long'];
        } else if (gl === 'work') {
          return ['consonants_r', 'consonants_th', 'mixed_sounds'];
        } else if (gl === 'exam') {
          return ['consonants_th', 'consonants_r', 'mixed_sounds'];
        } else if (gl === 'fluency') {
          return ['mixed_sounds', 'consonants_th', 'consonants_r', 'vowels_short', 'vowels_long'];
        }
        return [];
      };

      const goalSetKeys = pickGoalPreferredSetKeys(learningGoal);
      const basePriority: (keyof typeof VOCABULARY_WORD_SETS)[] = [
        ...preferredSetKeys,
        ...goalSetKeys,
      ];
      const prioritizedKeys: (keyof typeof VOCABULARY_WORD_SETS)[] = [
        ...basePriority,
        ...VOCABULARY_SET_KEYS.filter((k) => !basePriority.includes(k)),
      ];

      allWords = prioritizedKeys.flatMap((key) => VOCABULARY_WORD_SETS[key] as unknown as VocabularyWord[]);
    }

    // Filter by sound focus if provided
    let filtered = allWords.filter((w) => {
      const soundTypeOk = soundType ? w.soundType === soundType : true;
      const targetSoundOk = targetSound ? w.targetSound === targetSound : true;
      return soundTypeOk && targetSoundOk;
    });

    // Difficulty targeting based on onboarding language level
    const allowedDifficulties = new Set<'easy' | 'medium' | 'hard'>();
    if (levelUpper === 'A1') {
      allowedDifficulties.add('easy');
    } else if (levelUpper === 'A2') {
      allowedDifficulties.add('easy');
      allowedDifficulties.add('medium');
    } else if (levelUpper === 'B1') {
      allowedDifficulties.add('medium');
    } else if (levelUpper === 'B2') {
      allowedDifficulties.add('medium');
      allowedDifficulties.add('hard');
    } else if (levelUpper === 'C1' || levelUpper === 'C2') {
      allowedDifficulties.add('hard');
      allowedDifficulties.add('medium');
    }

    let filteredByLevel = allowedDifficulties.size > 0
      ? filtered.filter((w) => allowedDifficulties.has(w.difficulty))
      : filtered;

    // If filter is too strict, fall back to the whole pool
    if (filteredByLevel.length < count) {
      filteredByLevel = filtered;
    }

    // Difficulty targeting based on performance/spaced repetition
    const wantEasier = spacedRepetitionData?.difficultyAdjustment === 'decrease' ||
      (typeof performanceMetrics?.averageAccuracy === 'number' && performanceMetrics.averageAccuracy < ACCURACY_THRESHOLD) ||
      performanceMetrics?.strugglingAreas?.includes('vocabulary') ||
      performanceMetrics?.strugglingAreas?.includes('pronunciation');

    const wantHarder = spacedRepetitionData?.difficultyAdjustment === 'increase' && !wantEasier;

    const easy = filteredByLevel.filter((w) => w.difficulty === 'easy');
    const medium = filteredByLevel.filter((w) => w.difficulty === 'medium' || w.difficulty === 'hard');

    let selection: VocabularyWord[] = [];
    if (wantEasier) {
      selection = [...easy, ...medium];
    } else if (wantHarder) {
      selection = [...medium, ...easy];
    } else {
      // maintain: interleave
      const maxLen = Math.max(easy.length, medium.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < easy.length) selection.push(easy[i]);
        if (i < medium.length) selection.push(medium[i]);
      }
    }

    // Prioritize spaced-repetition review words and pronunciation-aligned words if present
    const reviewSet = new Set(spacedRepetitionData?.vocabularyReview || []);
    const desiredSounds = new Set<string>();
    const pronSetKeys = mapPronunciationTokensToSetKeys(spacedRepetitionData?.pronunciationReview || []);
    pronSetKeys.forEach((k) => {
      desiredTargetSoundsForSetKey(k).forEach((s) => desiredSounds.add(s));
    });
    // Do not add lesson-type labels to desiredSounds; rely on pronunciationReview-derived sounds only
    selection.sort((a, b) => {
      const aRev = reviewSet.has(a.word) ? 1 : 0;
      const bRev = reviewSet.has(b.word) ? 1 : 0;
      const aPron = desiredSounds.has(a.targetSound) ? 1 : 0;
      const bPron = desiredSounds.has(b.targetSound) ? 1 : 0;
      // review words first, then pronunciation-aligned
      if (bRev !== aRev) return bRev - aRev;
      if (bPron !== aPron) return bPron - aPron;
      return 0;
    });

    // Deduplicate by id/word, then take the requested count
    const seen = new Set<string>();
    const unique = selection.filter((w) => {
      const key = `${w.id}:${w.word}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // If still not enough, top up from allWords
    if (unique.length < count) {
      for (const w of allWords) {
        const key = `${w.id}:${w.word}`;
        if (!seen.has(key)) {
          unique.push(w);
          seen.add(key);
        }
        if (unique.length >= count) break;
      }
    }

    return unique.slice(0, count);
  }

  private getFallbackWordPairs(
    setsCount: number,
    pairsPerSet: number = 8,
    targetLanguage?: string,
    nativeLanguage?: string,
    languageLevel?: string,
    learningGoal?: string,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: LessonType[];
      strugglingAreas: LessonType[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    }
  ): Record<string, WordPair[]> {
    const result: Record<string, WordPair[]> = {};

    // 1) Try language-specific pool keyed by `${target}-${native}`; fallback to 'en-it'.
    const poolKey = targetLanguage && nativeLanguage ? `${targetLanguage}-${nativeLanguage}` : undefined;
    const languagePool = (poolKey && FALLBACK_WORD_PAIRS_POOLS[poolKey]) || FALLBACK_WORD_PAIRS_POOLS['en-it'] || [];

    // 2) If pool is somehow empty, fallback to legacy WORD_PAIR_SETS combined.
    let combined: WordPair[];
    if (languagePool.length > 0) {
      // Already shaped as { native, translation } per `${target}-${native}` pools
      combined = languagePool
      // If we have onboarding signals, slice by category ranges to prioritize relevance
      if (languageLevel || learningGoal) {
        try {
          // Defer import to avoid cyclic deps; constants are static
          const { FALLBACK_LEXICON_CATEGORY_RANGES } = require('../constants/constants');
          const ranges = FALLBACK_LEXICON_CATEGORY_RANGES;

          const pickRangesForOnboarding = (level?: string, goal?: string): Array<keyof typeof ranges> => {
            const lvl = (level || '').toUpperCase();
            const gl = (goal || '').toLowerCase();
            const base: Array<keyof typeof ranges> = ['verbs'];

            // Level tuning
            if (lvl === 'A1') {
              base.push('core', 'numbers', 'colors', 'animals');
            } else if (lvl === 'A2') {
              base.push('core', 'numbers', 'colors', 'animals', 'school');
            } else if (lvl === 'B1') {
              base.push('school', 'shopping', 'health', 'travel');
            } else if (lvl === 'B2' || lvl === 'C1' || lvl === 'C2') {
              base.push('work', 'exam', 'travel', 'health', 'shopping', 'advanced');
            }

            // Goal tuning with expanded domains (merged with level base)
            let goalExtras: Array<keyof typeof ranges> = [];
            if (gl === 'travel') {
              // favor travel and real-life scenarios; add numbers/colors only for A-levels
              goalExtras = ['travel', 'shopping', 'health'];
              if (lvl === 'A1' || lvl === 'A2') goalExtras.push('numbers', 'colors');
            } else if (gl === 'work') {
              // professional vocabulary; add numbers/colors only for A-levels
              goalExtras = ['work', 'school'];
              if (lvl === 'A1' || lvl === 'A2') goalExtras.push('numbers', 'colors');
            } else if (gl === 'exam') {
              // academic vocabulary; add numbers/colors only for A-levels
              goalExtras = ['exam', 'school'];
              if (lvl === 'A1' || lvl === 'A2') goalExtras.push('numbers', 'colors');
            } else if (gl === 'fluency') {
              // broad vocabulary expansion
              goalExtras = ['numbers', 'colors', 'animals', 'school', 'health', 'shopping'];
            }

            // Merge base + goal extras, preserving order and removing duplicates
            const merged = Array.from(new Set<keyof typeof ranges>([...base, ...goalExtras]));
            return merged;
          };

          const desired = pickRangesForOnboarding(languageLevel, learningGoal);
          const desiredIndices = new Set<number>();
          for (const key of desired) {
            const { start, end } = ranges[key];
            for (let i = start; i <= end; i++) desiredIndices.add(i);
          }

          // Remap combined to only desired indices; maintain original alignment
          combined = combined.filter((_, idx) => desiredIndices.has(idx));

          // CEFR-aware difficulty ordering using category ranges
          const levelUpper = (languageLevel || '').toUpperCase();
          const allowedDifficulties = new Set<'easy' | 'medium' | 'hard'>();
          if (levelUpper === 'A1') {
            allowedDifficulties.add('easy');
          } else if (levelUpper === 'A2') {
            allowedDifficulties.add('easy');
            allowedDifficulties.add('medium');
          } else if (levelUpper === 'B1') {
            allowedDifficulties.add('medium');
          } else if (levelUpper === 'B2' || levelUpper === 'C1' || levelUpper === 'C2') {
            allowedDifficulties.add('medium');
            allowedDifficulties.add('hard');
          }

          const wantEasier = spacedRepetitionData?.difficultyAdjustment === 'decrease' ||
            (typeof performanceMetrics?.averageAccuracy === 'number' && performanceMetrics.averageAccuracy < ACCURACY_THRESHOLD) ||
            performanceMetrics?.strugglingAreas?.includes('word_pairs');
          const wantHarder = spacedRepetitionData?.difficultyAdjustment === 'increase' && !wantEasier;

          const getCategoryForIndex = (i: number): keyof typeof ranges | 'unknown' => {
            for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
              const { start, end } = ranges[key];
              if (i >= start && i <= end) return key;
            }
            return 'unknown';
          };
          const easyCats: Array<keyof typeof ranges> = ['core', 'numbers', 'colors', 'animals'];
          const mediumCats: Array<keyof typeof ranges> = ['school', 'shopping', 'health', 'verbs', 'travel'];
          const hardCats: Array<keyof typeof ranges> = ['work', 'exam', 'advanced'];

          const withDifficulty = combined.map((wp, idx) => {
            const category = getCategoryForIndex(idx);
            let diff: 'easy' | 'medium' | 'hard' = 'medium';
            if (category !== 'unknown') {
              if (easyCats.includes(category)) diff = 'easy';
              else if (mediumCats.includes(category)) diff = 'medium';
              else if (hardCats.includes(category)) diff = 'hard';
            }
            return { wp, diff };
          });

          let filteredByLevel = allowedDifficulties.size > 0
            ? withDifficulty.filter((d) => allowedDifficulties.has(d.diff))
            : withDifficulty;

          if (filteredByLevel.length === 0) filteredByLevel = withDifficulty;

          let ordered: typeof filteredByLevel;
          if (wantHarder) {
            ordered = [
              ...filteredByLevel.filter((d) => d.diff === 'hard'),
              ...filteredByLevel.filter((d) => d.diff === 'medium'),
              ...filteredByLevel.filter((d) => d.diff === 'easy'),
            ];
          } else if (wantEasier) {
            ordered = [
              ...filteredByLevel.filter((d) => d.diff === 'easy'),
              ...filteredByLevel.filter((d) => d.diff === 'medium'),
              ...filteredByLevel.filter((d) => d.diff === 'hard'),
            ];
          } else {
            ordered = [
              ...filteredByLevel.filter((d) => d.diff !== 'easy'),
              ...filteredByLevel.filter((d) => d.diff === 'easy'),
            ];
          }

          combined = ordered.map((d) => d.wp);
        } catch (e) {
          // If categorization is unavailable, proceed with full pool
          console.warn('Category slicing unavailable, proceeding without onboarding filter:', e);
        }
      }
    } else {
      const keys = [...WORD_PAIRS_SET_KEYS];
      if (spacedRepetitionData?.difficultyAdjustment === 'increase') {
        keys.reverse();
      }
      combined = keys.flatMap((k) => WORD_PAIR_SETS[k] as unknown as WordPair[]);
    }

    // Light prioritization: place review words first if present
    const reviewSet = new Set(spacedRepetitionData?.vocabularyReview || []);
    combined.sort((a, b) => {
      const aRev = reviewSet.has(a.translation) ? 1 : 0;
      const bRev = reviewSet.has(b.translation) ? 1 : 0;
      return bRev - aRev;
    });

    // Build a session-wide unique list to avoid repetition across sets.
    const seenSession = new Set<string>();
    const uniqueSession: WordPair[] = [];
    for (const wp of combined) {
      const key = `${wp.translation}|||${wp.native}`;
      if (!seenSession.has(key)) {
        uniqueSession.push(wp);
        seenSession.add(key);
      }
    }

    // If we still don't have enough unique pairs to fill the whole session,
    // we will top up from the original combined list but will keep sets free of intra-set duplicates.
    const totalNeeded = setsCount * pairsPerSet;
    const supply = uniqueSession.length >= totalNeeded ? uniqueSession : combined;

    let cursor = 0;
    for (let i = 1; i <= setsCount; i++) {
      const setPairs: WordPair[] = [];
      const setSeen = new Set<string>();

      while (setPairs.length < pairsPerSet) {
        // Wrap-around cursor over supply
        const item = supply[cursor % supply.length];
        cursor++;
        const key = `${item.translation}|||${item.native}`;
        if (!setSeen.has(key)) {
          setSeen.add(key);
          setPairs.push(item);
        }

        // Safety: if supply is extremely small, break potential infinite loop
        if (setSeen.size < pairsPerSet && setSeen.size >= supply.length) {
          break;
        }
      }

      result[`set${i}`] = setPairs;
    }

    return result;
  }

  // Method to test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('AI Service connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
