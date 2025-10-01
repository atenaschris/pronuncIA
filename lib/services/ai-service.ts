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
      "completed": false,
      "locked": false
    }
  ]
}

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT OR FORMATTING.`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

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

Respond with valid JSON array matching this structure:
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

Make words relevant to the user's learning goal and appropriate for their level and performance.`
        },
        {
          role: 'user',
          content: `Generate ${count} vocabulary words for ${targetLanguage} pronunciation practice.`
        }
      ];

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

      const vocabularyWords = JSON.parse(content);
      
      if (!Array.isArray(vocabularyWords) || !this.validateVocabularyWords(vocabularyWords)) {
        throw new Error('Invalid vocabulary words format received from AI');
      }

      return vocabularyWords;
    } catch (error) {
      console.error('Error generating vocabulary words:', error);
      return this.getFallbackVocabularyWords(count, soundType, targetSound);
    }
  }

  // Generate personalized word pairs based on user preferences and performance data
  async generateWordPairs(
    targetLanguage: string,
    nativeLanguage: string,
    languageLevel: string,
    learningGoal: string,
    count: number = 8,
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
  ): Promise<WordPair[]> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: `You are an expert language learning coach. Generate ${count} word pairs for translation practice.

REQUIREMENTS:
- Target language: ${targetLanguage}
- User's native language: ${nativeLanguage}
- Language level: ${languageLevel}
- Learning goal: ${learningGoal}

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

Respond with valid JSON array matching this structure:
[{
  "english": "word_or_phrase_in_target_language",
  "translation": "translation_in_native_language"
}]

Note: Despite the field name "english", use the target language (${targetLanguage}) for the first field.
Make the pairs relevant to the user's learning goal, appropriate for their level, and adaptive to their performance.`
        },
        {
          role: 'user',
          content: `Generate ${count} word pairs for ${targetLanguage} to ${nativeLanguage} translation practice.`
        }
      ];

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

      const wordPairs = JSON.parse(content);
      
      if (!Array.isArray(wordPairs) || !this.validateWordPairs(wordPairs)) {
        throw new Error('Invalid word pairs format received from AI');
      }

      return wordPairs;
    } catch (error) {
      console.error('Error generating word pairs:', error);
      return this.getFallbackWordPairs(count);
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

  // Fallback methods
  private getFallbackVocabularyWords(count: number, soundType?: string, targetSound?: string): VocabularyWord[] {
    const fallbackWords: VocabularyWord[] = [
      {
        id: 'fallback1',
        word: 'hello',
        phonetic: '/həˈloʊ/',
        definition: 'a greeting',
        example: 'Hello, how are you?',
        difficulty: 'easy',
        soundType: 'mixed',
        targetSound: 'h'
      },
      {
        id: 'fallback2',
        word: 'thank',
        phonetic: '/θæŋk/',
        definition: 'to express gratitude',
        example: 'Thank you for your help.',
        difficulty: 'easy',
        soundType: 'consonant',
        targetSound: 'θ'
      },
      {
        id: 'fallback3',
        word: 'water',
        phonetic: '/ˈwɔːtər/',
        definition: 'a clear liquid',
        example: 'I drink water every day.',
        difficulty: 'easy',
        soundType: 'mixed',
        targetSound: 'w'
      }
    ];

    return fallbackWords.slice(0, count);
  }

  private getFallbackWordPairs(count: number): WordPair[] {
    const fallbackPairs: WordPair[] = [
      { english: 'hello', translation: 'ciao' },
      { english: 'thank you', translation: 'grazie' },
      { english: 'water', translation: 'acqua' },
      { english: 'house', translation: 'casa' },
      { english: 'book', translation: 'libro' },
      { english: 'friend', translation: 'amico' },
      { english: 'food', translation: 'cibo' },
      { english: 'time', translation: 'tempo' }
    ];

    return fallbackPairs.slice(0, count);
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