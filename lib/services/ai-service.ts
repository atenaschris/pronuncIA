import {
  ACCURACY_THRESHOLD,
  VOCABULARY_SET_KEYS,
  VOCABULARY_WORD_SETS,
  WORD_PAIR_SETS,
  WORD_PAIRS_SET_KEYS,
} from "../constants/constants";
import { desiredTargetSoundsForSetKey, mapPronunciationTokensToSetKeys } from "../helpers/sound-mapping-utils";
import { DailyPlan } from "../store/lesson-store";
import { VocabularyWord } from "../types/vocabulary";
import { WordPair } from "../types/word-pairs";

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
        {
          role: 'system',
          content: `You are an expert language pronunciation coach and learning specialist. Your task is to generate personalized daily lesson plans that help users improve their pronunciation and speaking skills in their target language.

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

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.`
        },
        {
          role: 'user',
          content: prompt
        }
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

      // Add missing properties if not provided by AI
      if (typeof parsedPlan.totalXp !== 'number') {
        parsedPlan.totalXp = parsedPlan.lessons?.reduce((sum: number, lesson: any) => sum + (lesson.xpReward || 0), 0) || 0;
      }
      
      if (typeof parsedPlan.completedLessons !== 'number') {
        parsedPlan.completedLessons = 0;
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
    targetLanguage: string,
    nativeLanguage: string,
    languageLevel: string,
    learningGoal: string,
    count: number = 5,
    soundType?: 'consonant' | 'vowel' | 'mixed',
    targetSound?: string,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: string[];
      strugglingAreas: string[];
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
          content: `You are an expert language pronunciation coach. Generate ${count} vocabulary words for pronunciation practice.

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

Consider pronunciation challenges that ${nativeLanguage} speakers face when learning ${targetLanguage}.
${performanceMetrics?.strugglingAreas.includes('vocabulary') ? 'Focus on easier words to build confidence as user struggles with vocabulary.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'increase' ? 'Include more challenging words as user is performing well.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'decrease' ? 'Include simpler, more common words to build foundation.' : ''}
${spacedRepetitionData?.vocabularyReview.length ? `Prioritize words similar to these review words: ${spacedRepetitionData.vocabularyReview.slice(0, 3).join(', ')}` : ''}

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

RESPOND WITH ONLY THE JSON ARRAY - NO OTHER TEXT OR FORMATTING.`
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
      return this.getFallbackVocabularyWords(count, soundType, targetSound, performanceMetrics, spacedRepetitionData);
    }
  }

  // Generate personalized word pairs based on user preferences and performance data
  async generateWordPairs(
    targetLanguage: string,
    nativeLanguage: string,
    languageLevel: string,
    learningGoal: string,
    setsCount: number = 10,
    pairsPerSet: number = 8,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: string[];
      strugglingAreas: string[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    }
  ): Promise<Record<string, Array<{ english: string; translation: string }>>> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are an expert language learning coach. Generate ${setsCount} sets of ${pairsPerSet} word pairs each for translation practice.

CRITICAL INSTRUCTIONS:
1. ALWAYS respond with ONLY valid JSON - no markdown, no explanations, no code blocks
2. The response must start with { and end with }
3. Do not wrap the JSON in \`\`\`json or any other formatting
4. Respond with ONLY the JSON object - NO OTHER TEXT OR FORMATTING

REQUIREMENTS:
- Target language: ${targetLanguage}
- User's native language: ${nativeLanguage}
- Language level: ${languageLevel}
- Learning goal: ${learningGoal}
- Generate exactly ${setsCount} sets
- Each set should contain exactly ${pairsPerSet} word pairs

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

Create word pairs that help users learn ${targetLanguage} vocabulary relevant to their learning goal.
Consider the user's proficiency level when selecting appropriate words and phrases.
${performanceMetrics?.strugglingAreas.includes('word_pairs') ? 'Focus on simpler, more common word pairs as user struggles with this lesson type.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'increase' ? 'Include more challenging vocabulary and phrases as user is performing well.' : ''}
${spacedRepetitionData?.difficultyAdjustment === 'decrease' ? 'Include basic, high-frequency words to build foundation.' : ''}
${spacedRepetitionData?.vocabularyReview.length ? `Include these words that need review: ${spacedRepetitionData.vocabularyReview.slice(0, 4).join(', ')}` : ''}

Respond with valid JSON object matching this exact structure:
{
  "set1": [
    {"english": "word_or_phrase_in_target_language", "translation": "translation_in_native_language"},
    ...
  ],
  "set2": [...],
  ...
}

Note: Despite the field name "english", use the target language (${targetLanguage}) for the first field.
Make the pairs relevant to the user's learning goal, appropriate for their level, and adaptive to their performance.

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.`
        },
        {
          role: 'user',
          content: `Generate ${setsCount} sets of ${pairsPerSet} word pairs each for ${targetLanguage} to ${nativeLanguage} translation practice.`
        }
      ];

      if(messages.length) {
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
      
      if (!wordPairsData || typeof wordPairsData !== 'object' || !this.validateWordPairsSets(wordPairsData)) {
        throw new Error('Invalid word pairs format received from AI');
      }

      return wordPairsData;
    } catch (error) {
      console.error('Error generating word pairs:', error);
      return this.getFallbackWordPairs(setsCount, pairsPerSet, performanceMetrics, spacedRepetitionData);
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
      typeof pair.english === 'string' &&
      typeof pair.translation === 'string'
    );
  }

  private validateWordPairsSets(data: any): data is Record<string, Array<{ english: string; translation: string }>> {
    if (!data || typeof data !== 'object') return false;
    
    return Object.values(data).every(set => 
      Array.isArray(set) && this.validateWordPairs(set)
    );
  }

  // Fallback methods
  private getFallbackVocabularyWords(
    count: number,
    soundType?: string,
    targetSound?: string,
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: string[];
      strugglingAreas: string[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    }
  ): VocabularyWord[] {
    // Prefer sets that align with pronunciation review tokens
    const preferredSetKeys: (keyof typeof VOCABULARY_WORD_SETS)[] = mapPronunciationTokensToSetKeys(
      spacedRepetitionData?.pronunciationReview || []
    );

    const prioritizedKeys: (keyof typeof VOCABULARY_WORD_SETS)[] = [
      ...preferredSetKeys,
      ...VOCABULARY_SET_KEYS.filter((k) => !preferredSetKeys.includes(k)),
    ];

    // Build a pool from curated sets in prioritized order
    const allWords: VocabularyWord[] = prioritizedKeys.flatMap((key) => VOCABULARY_WORD_SETS[key] as unknown as VocabularyWord[]);

    // Filter by sound focus if provided
    let filtered = allWords.filter((w) => {
      const soundTypeOk = soundType ? w.soundType === soundType : true;
      const targetSoundOk = targetSound ? w.targetSound === targetSound : true;
      return soundTypeOk && targetSoundOk;
    });

    // If filter is too strict, fall back to the whole pool
    if (filtered.length < count) {
      filtered = allWords;
    }

    // Difficulty targeting based on performance/spaced repetition
    const wantEasier = spacedRepetitionData?.difficultyAdjustment === 'decrease' ||
      (typeof performanceMetrics?.averageAccuracy === 'number' && performanceMetrics.averageAccuracy < ACCURACY_THRESHOLD) ||
      performanceMetrics?.strugglingAreas?.includes('vocabulary') ||
      performanceMetrics?.strugglingAreas?.includes('pronunciation');

    const wantHarder = spacedRepetitionData?.difficultyAdjustment === 'increase' && !wantEasier;

    const easy = filtered.filter((w) => w.difficulty === 'easy');
    const medium = filtered.filter((w) => w.difficulty === 'medium' || w.difficulty === 'hard');

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
    preferredSetKeys.forEach((k) => {
      for (const s of desiredTargetSoundsForSetKey(k)) desiredSounds.add(s);
    });
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
    performanceMetrics?: {
      completionRate: number;
      averageAccuracy: number;
      preferredLessonTypes: string[];
      strugglingAreas: string[];
    },
    spacedRepetitionData?: {
      vocabularyReview: string[];
      pronunciationReview: string[];
      difficultyAdjustment: 'increase' | 'maintain' | 'decrease';
    }
  ): Record<string, Array<{ english: string; translation: string }>> {
    const result: Record<string, Array<{ english: string; translation: string }>> = {};

    // Choose set order based on difficulty adjustment: earlier sets assumed simpler
    const keys = [...WORD_PAIRS_SET_KEYS];
    if (spacedRepetitionData?.difficultyAdjustment === 'increase') {
      // rotate keys so later sets come first
      keys.reverse();
    }

    // Build a combined pool from selected sets
    const combined: WordPair[] = keys.flatMap((k) => WORD_PAIR_SETS[k] as unknown as WordPair[]);

    // Light prioritization: place review words first if present
    const reviewSet = new Set(spacedRepetitionData?.vocabularyReview || []);
    combined.sort((a, b) => {
      const aRev = reviewSet.has(a.english) ? 1 : 0;
      const bRev = reviewSet.has(b.english) ? 1 : 0;
      return bRev - aRev;
    });

    // If user struggles with word_pairs, keep to simpler cycling order
    const cycle = spacedRepetitionData?.difficultyAdjustment === 'decrease' ||
      performanceMetrics?.strugglingAreas?.includes('word_pairs')
      ? combined
      : combined;

    for (let i = 1; i <= setsCount; i++) {
      const setPairs: WordPair[] = [];
      const startIndex = ((i - 1) * pairsPerSet) % cycle.length;
      for (let j = 0; j < pairsPerSet; j++) {
        const idx = (startIndex + j) % cycle.length;
        setPairs.push(cycle[idx]);
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