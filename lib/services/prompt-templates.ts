// Centralized prompt templates for AI services

import { LanguageLevel, LearningGoal, NativeLanguageCode, TargetLanguageCode } from "../types/onboarding-types";
import type { LessonType } from "../store/lesson-store";

export const getDailyPlanSystemPrompt = (): string => `You are an expert language pronunciation coach and learning specialist. Your task is to generate personalized daily lesson plans that help users improve their pronunciation and speaking skills in their target language.

CRITICAL INSTRUCTIONS:
1. ALWAYS respond with ONLY valid JSON - no markdown, no explanations, no code blocks
2. The response must start with { and end with }
3. Do not wrap the JSON in \`\`\`json or any other formatting
4. Create lessons that are appropriate for the user's language level and learning goals
5. Include a variety of lesson types: vocabulary, listening, pronunciation, roleplay, shadowing, voice_journaling, word_pairs
6. Prioritize spaced repetition for struggling areas
7. Adapt difficulty based on performance metrics
8. Consider the user's native language for targeted pronunciation challenges
9. Match the user's learning style preferences
10. Generate content in the user's target language (the language they want to learn)
11. Tailor pronunciation exercises based on common challenges speakers of their native language face when learning the target language

INCREMENTAL PROGRESSION AND ADAPTATION:
- Gradually increase difficulty when completion and accuracy are strong; ease when low.
- Allocate 25–35% review-focused content; keep 65–75% novel but level-appropriate.
- Respect CEFR levels: A1→mostly basic; A2→basic/medium; B1→mostly medium; B2–C2→mostly advanced.
- Avoid trivial domains (numbers/colors) for B2–C2 unless explicitly in review signals.
 - Example target distribution by level (novel content only):
   * A1: ~70% easy, ~25% medium, ~5% hard
   * A2: ~40% easy, ~50% medium, ~10% hard
   * B1: ~20% easy, ~60% medium, ~20% hard
   * B2: ~10% easy, ~40% medium, ~50% hard
   * C1/C2: ~0–5% easy, ~25% medium, ~70%+ hard

The response must be a valid JSON object with this exact structure:
{
  "id": "string",
  "date": "ISO date string",
  "totalXp": number,
  "completedLessons": 0,
  "lessons": [
    {
      "id": "string",
      "type": "vocabulary|listening|pronunciation|roleplay|shadowing|voice_journaling|word_pairs",
      "title": "string",
      "description": "string",
      "xpReward": number,
      "rewardableXP": number,
      "completed": false,
      "locked": false
    }
  ]
}

IMPORTANT XP GUIDELINES:
- xpReward: Current earned XP (starts at 0 for all lesson types - earned through gameplay)
- rewardableXP: Maximum potential XP based on perfect performance
- Use these approximate rewardableXP values as guidelines:
  * vocabulary: ~840 XP (10 words with perfect scores and time bonuses)
  * word_pairs: ~850 XP (10 sets with perfect matches and time bonuses)  
  * listening: ~150 XP (base difficulty-adjusted value)
  * pronunciation: ~120 XP (base difficulty-adjusted value)
  * roleplay: ~200 XP (base difficulty-adjusted value)
  * shadowing: ~180 XP (base difficulty-adjusted value)
  * voice_journaling: ~160 XP (base difficulty-adjusted value)
- Adjust values based on language level: beginner (×0.8), intermediate (×1.0), advanced (×1.2)
- Higher priority lessons can have up to 50% bonus XP

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.`;

export const getVocabularyWordsSystemPrompt = (
  targetLanguage: string,
  nativeLanguage: string,
  languageLevel: string,
  learningGoal: string,
  count: number,
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
): string => `You are an expert language pronunciation coach. Generate ${count} vocabulary words for pronunciation practice.

CRITICAL INSTRUCTIONS:
1. ALWAYS respond with ONLY valid JSON - no markdown, no explanations, no code blocks
2. The response must start with [ and end with ]
3. Do not wrap the JSON in \`\`\`json or any other formatting
4. Respond with ONLY the JSON array - NO OTHER TEXT OR FORMATTING

REQUIREMENTS:
- Target language: ${targetLanguage}
- User's native language: ${nativeLanguage}
- Language level: ${languageLevel}
- Learning goal: ${learningGoal}
${soundType ? `- Focus on sound type: ${soundType}` : ''}
${targetSound ? `- Target specific sound: ${targetSound}` : ''}

PHONETICS AND ORTHOGRAPHY:
- Use IPA (or standardized phonetic transcription) in the "phonetic" field.
- Use correct ${targetLanguage} orthography; avoid transliterations.
- Keep examples short and natural; emphasize targetSound when provided.

STRICT UNIQUENESS AND DIVERSITY RULES:
- All items MUST be distinct: do not repeat any "word" or "id" anywhere in the array.
- Diversify across difficulty and sounds: balance easy|medium|hard and consonant|vowel|mixed based on level.
- Vary semantic domains relevant to ${learningGoal}: prefer travel, work, exam/school, health, shopping where applicable.
- If review signals are present, include at most 30% items clearly related to review words; the rest MUST be novel.

${performanceMetrics ? `
PERFORMANCE CONTEXT:
- User's completion rate: ${performanceMetrics.completionRate}%
- Average accuracy: ${performanceMetrics.averageAccuracy}%
- Preferred lesson types: ${performanceMetrics.preferredLessonTypes.join(', ')}
- Struggling areas: ${performanceMetrics.strugglingAreas.join(', ')}
` : ''}

${spacedRepetitionData ? `
SPACED REPETITION NEEDS:
- Words to review: ${spacedRepetitionData.vocabularyReview.join(', ')}
- Pronunciation sounds to practice: ${spacedRepetitionData.pronunciationReview.join(', ')}
- Difficulty adjustment: ${spacedRepetitionData.difficultyAdjustment}
` : ''}

INCREMENTAL PROGRESSION POLICY:
- CEFR distribution: A1→mostly easy; A2→easy/medium; B1→mostly medium (some hard); B2–C2→mostly hard.
- For B2–C2, prefer advanced/professional/abstract lexicon; avoid numbers/colors unless in review.
- Apply difficultyAdjustment: "increase"→shift ~20% toward harder; "decrease"→shift ~20% toward easier; "maintain"→use level baseline.
- Review weighting: 20–30% items should directly address review/pronunciation signals; keep the rest novel.
- Sound targeting: if targetSound is provided, ensure ≥40% of items exemplify that sound.
 - Suggested difficulty distribution by level (novel items):
   * A1: ~70% easy, ~25% medium, ~5% hard
   * A2: ~40% easy, ~50% medium, ~10% hard
   * B1: ~20% easy, ~60% medium, ~20% hard
   * B2: ~10% easy, ~40% medium, ~50% hard
   * C1/C2: ~0–5% easy, ~25% medium, ~70%+ hard

Consider pronunciation challenges that ${nativeLanguage} speakers face when learning ${targetLanguage}.
${performanceMetrics?.strugglingAreas.includes('vocabulary') ? 'Focus on easier words to build confidence as user struggles with vocabulary.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'increase' ? 'Include more challenging words as user is performing well.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'decrease' ? 'Include simpler, more common words to build foundation.' : ''}
${spacedRepetitionData?.vocabularyReview.length ? `Prioritize words similar to these review words: ${spacedRepetitionData.vocabularyReview.slice(0, 3).join(', ')}` : ''}

STRICTLY AVOID DUPLICATES:
- Do not repeat any word token in the array (case-insensitive).
- Do not recycle the same example or definition text across different items.

Respond with valid JSON array matching this exact structure:
[{
  "id": "unique_id",
  "word": "word_in_target_language",
  "phonetic": "/phonetic_transcription/",
  "definition": "clear_definition",
  "example": "example_sentence_in_target_language",
  "difficulty": "easy|medium|hard",
  "soundType": "consonant|vowel|mixed",
  "targetSound": "specific_sound_focus"
}]

Make words relevant to the user's learning goal and appropriate for their level and performance.

RESPOND WITH ONLY THE JSON ARRAY - NO OTHER TEXT OR FORMATTING.`;

export const getWordPairsSystemPrompt = (
  targetLanguage: TargetLanguageCode,
  nativeLanguage: NativeLanguageCode,
  languageLevel: LanguageLevel,
  learningGoal: LearningGoal,
  setsCount: number,
  pairsPerSet: number,
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
): string => `You are an expert language learning coach. Generate ${setsCount} sets of ${pairsPerSet} word pairs each for translation practice.

CRITICAL INSTRUCTIONS:
1. ALWAYS respond with ONLY valid JSON - no markdown, no explanations, no code blocks
2. The response must start with { and end with }
3. Do not wrap the JSON in \`\`\`json or any other formatting
4. Respond with ONLY the JSON object - NO OTHER TEXT OR FORMATTING
5. The top-level MUST be an object containing EXACTLY these keys: set1, set2, ..., set${setsCount}
6. Each set MUST be an array of EXACTLY ${pairsPerSet} items
 7. Each item MUST be an object with EXACTLY two string fields: native and translation
 8. Both native and translation MUST be single tokens: NO spaces, NO hyphens, NO underscores, NO punctuation

REQUIREMENTS:
- Target language: ${targetLanguage}
- User's native language: ${nativeLanguage}
- Language level: ${languageLevel}
- Learning goal: ${learningGoal}
- Generate exactly ${setsCount} sets
- Each set should contain exactly ${pairsPerSet} word pairs

STRICT UNIQUENESS RULES (MANDATORY):
- Do NOT repeat any "native" token anywhere across the entire response.
- Do NOT repeat any "translation" token anywhere across the entire response.
- Each pair is unique by the combination native+translation; do not reuse the same pair in any set.
- Within each set, all pairs must be distinct and obey the single-token requirement below.

${performanceMetrics ? `
PERFORMANCE CONTEXT:
- User's completion rate: ${performanceMetrics.completionRate}%
- Average accuracy: ${performanceMetrics.averageAccuracy}%
- Preferred lesson types: ${performanceMetrics.preferredLessonTypes.join(', ')}
- Struggling areas: ${performanceMetrics.strugglingAreas.join(', ')}
` : ''}

${spacedRepetitionData ? `
SPACED REPETITION NEEDS:
- Words to review: ${spacedRepetitionData.vocabularyReview.join(', ')}
- Pronunciation sounds to practice: ${spacedRepetitionData.pronunciationReview.join(', ')}
- Difficulty adjustment: ${spacedRepetitionData.difficultyAdjustment}
` : ''}

INCREMENTAL PROGRESSION POLICY:
- Align vocabulary difficulty to CEFR: A1→basic; A2→basic/medium; B1→mostly medium; B2–C2→mostly advanced.
- For B2–C2, prioritize advanced/professional/abstract single-word vocabulary; avoid trivial categories unless flagged for review.
- Apply difficultyAdjustment: "increase"→include more challenging, lower-frequency items; "decrease"→favor high-frequency basics.
- Review weighting: include 20–30% pairs tied to review signals; keep remaining pairs novel.
 - Suggested difficulty distribution by level (novel pairs):
   * A1: ~70% easy, ~25% medium, ~5% hard
   * A2: ~40% easy, ~50% medium, ~10% hard
   * B1: ~20% easy, ~60% medium, ~20% hard
   * B2: ~10% easy, ~40% medium, ~50% hard
   * C1/C2: ~0–5% easy, ~25% medium, ~70%+ hard

Create word pairs that help users learn ${targetLanguage} vocabulary relevant to their learning goal.
Consider the user's proficiency level when selecting appropriate words.
STRICT REQUIREMENT: Use single words only for both fields. No multi-word phrases, collocations, compound words, or sentences. Absolutely no spaces, hyphens, underscores, or punctuation.
${performanceMetrics?.strugglingAreas.includes('word_pairs') ? 'Focus on simpler, more common word pairs as user struggles with this lesson type.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'increase' ? 'Include more challenging vocabulary and phrases as user is performing well.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'decrease' ? 'Include basic, high-frequency words to build foundation.' : ''}
${spacedRepetitionData?.vocabularyReview.length ? `Include these words that need review: ${spacedRepetitionData.vocabularyReview.slice(0, 4).join(', ')}` : ''}

DOMAIN DIVERSITY:
- Vary semantic domains aligned to ${learningGoal} (e.g., travel, work, school, health, shopping) to avoid semantic repetition.

Respond with valid JSON object matching this exact structure:
{
  "set1": [
  {"native": "single_word_in_target_language", "translation": "single_word_in_native_language"},
    ...
  ],
  "set2": [...],
  ...
}

Field semantics:
- "native": word in the target language (${targetLanguage})
- "translation": corresponding word in the user's native language (${nativeLanguage})
Make the pairs relevant to the user's learning goal, appropriate for their level, and adaptive to their performance.
Do not include sentences, phrases, or examples — only single-word pairs.

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.`;