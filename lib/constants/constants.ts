
export const LANGUAGE_LEVELS = [
  { id: 'A1', label: 'Beginner (A1)', description: 'Basic phrases and expressions' },
  { id: 'A2', label: 'Elementary (A2)', description: 'Simple conversations' },
  { id: 'B1', label: 'Intermediate (B1)', description: 'Clear standard input' },
  { id: 'B2', label: 'Upper Intermediate (B2)', description: 'Complex topics' },
  { id: 'C1', label: 'Advanced (C1)', description: 'Effective mastery' },
  { id: 'C2', label: 'Mastery (C2)', description: 'Near-native proficiency' },
] as const;

export const LANGUAGE_LEVEL_LABELS = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper Intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
} as const;

export const NATIVE_LANGUAGES = [
  { id: 'it', label: 'Italian', description: 'Romance language with melodic pronunciation and clear vowel sounds' },
  { id: 'es', label: 'Spanish', description: 'Romance language with consistent pronunciation rules' },
  { id: 'fr', label: 'French', description: 'Romance language with unique nasal sounds and silent letters' },
  { id: 'de', label: 'German', description: 'Germanic language with strong consonants and compound words' },
  { id: 'pt', label: 'Portuguese', description: 'Romance language with distinctive nasal vowels and soft consonants' },
  { id: 'ru', label: 'Russian', description: 'Slavic language with complex consonant clusters and soft/hard sounds' },
  { id: 'zh', label: 'Chinese', description: 'Tonal language with unique phonetic system and character-based writing' },
  { id: 'ja', label: 'Japanese', description: 'Pitch-accent language with simple phonetic structure' },
  { id: 'ko', label: 'Korean', description: 'Agglutinative language with unique alphabet and pronunciation rules' },
  { id: 'ar', label: 'Arabic', description: 'Semitic language with rich phonetic system and distinctive sounds' },
] as const;

export const NATIVE_LANGUAGE_LABELS = {
  it: 'Italian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
} as const;

export const TARGET_LANGUAGES = [
  { id: 'en', label: 'English', description: 'Learn English pronunciation and speaking skills' },
  { id: 'es', label: 'Spanish', description: 'Learn Spanish pronunciation and speaking skills' },
  { id: 'fr', label: 'French', description: 'Learn French pronunciation and speaking skills' },
  { id: 'de', label: 'German', description: 'Learn German pronunciation and speaking skills' },
  { id: 'it', label: 'Italian', description: 'Learn Italian pronunciation and speaking skills' },
  { id: 'pt', label: 'Portuguese', description: 'Learn Portuguese pronunciation and speaking skills' },
  { id: 'zh', label: 'Chinese', description: 'Learn Chinese pronunciation and speaking skills' },
  { id: 'ja', label: 'Japanese', description: 'Learn Japanese pronunciation and speaking skills' },
  { id: 'ko', label: 'Korean', description: 'Learn Korean pronunciation and speaking skills' },
  { id: 'ru', label: 'Russian', description: 'Learn Russian pronunciation and speaking skills' },
] as const;

export const TARGET_LANGUAGE_LABELS = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
} as const;

export const LEARNING_GOALS = [
  {
    id: 'travel',
    label: 'Travel & Tourism',
    description: 'Learn essential phrases for traveling and tourism',
  },
  {
    id: 'fluency',
    label: 'General Fluency', 
    description: 'Improve overall speaking ability and confidence',
  },
  {
    id: 'work',
    label: 'Professional Growth',
    description: 'Focus on business and workplace communication',
  },
  {
    id: 'exam',
    label: 'Exam Preparation',
    description: 'Prepare for English proficiency tests (IELTS, TOEFL)',
  },
] as const;


export const LEARNING_GOAL_LABELS = {
  travel: 'Travel & Tourism',
  fluency: 'General Fluency',
  work: 'Professional Growth',
  exam: 'Exam Preparation',
} as const;

export const LEARNING_STYLES = [
  {
    id: 'visual',
    label: 'Visual Learner',
    description: 'Learn through diagrams, videos, and visual feedback',
  },
  {
    id: 'audio',
    label: 'Audio Learner',
    description: 'Focus on listening and speaking exercises',
  },
  {
    id: 'conversational',
    label: 'Conversational Learner',
    description: 'Practice through interactive dialogues and role-play',
  },
] as const;

export const LEARNING_STYLE_LABELS = {
  visual: 'Visual Learner',
  audio: 'Audio Learner',
  conversational: 'Conversational Learner',
} as const;

export const TIME_OPTIONS = [
  { id: "5",  label: '5 minutes' },
  { id: "10",  label: '10 minutes' },
  { id: "15",  label: '15 minutes' },
  { id: "20",  label: '20 minutes' },
  { id: "30",  label: '30 minutes' },
  { id: "45",  label: '45 minutes' },
  { id: "60",  label: '1 hour' },
] as const;

// Derived from TIME_OPTIONS to eliminate redundancy and ensure consistency
export const DAILY_PRACTICE_TIME_LABELS = TIME_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.label;
  return acc;
}, {} as Record<typeof TIME_OPTIONS[number]['id'], typeof TIME_OPTIONS[number]['label']>);

// Sample word pairs for the game
export const WORD_PAIR_SETS = {
  set1: [
    { english: 'of the', translation: 'dello' },
    { english: 'me at', translation: 'mi a' },
    { english: 'after', translation: 'dopo' },
    { english: 'since', translation: 'da' },
    { english: 'which', translation: 'quale' },
    { english: 'this', translation: 'questo' },
    { english: 'that', translation: 'quello' },
    { english: 'here', translation: 'qui' },
  ],
  set2: [
    { english: 'hello', translation: 'ciao' },
    { english: 'goodbye', translation: 'arrivederci' },
    { english: 'yes', translation: 'sì' },
    { english: 'no', translation: 'no' },
    { english: 'please', translation: 'per favore' },
    { english: 'thank you', translation: 'grazie' },
    { english: 'apple', translation: 'mela' },
    { english: 'water', translation: 'acqua' },
  ],
   set3: [
    { english: 'house', translation: 'casa' },
    { english: 'car', translation: 'macchina' },
    { english: 'book', translation: 'libro' },
    { english: 'tree', translation: 'albero' },
    { english: 'sun', translation: 'sole' },
    { english: 'moon', translation: 'luna' },
    { english: 'friend', translation: 'amico' },
    { english: 'family', translation: 'famiglia' },
  ],
/*   set4: [
    { english: 'eat', translation: 'mangiare' },
    { english: 'drink', translation: 'bere' },
    { english: 'sleep', translation: 'dormire' },
    { english: 'read', translation: 'leggere' },
    { english: 'write', translation: 'scrivere' },
    { english: 'speak', translation: 'parlare' },
    { english: 'listen', translation: 'ascoltare' },
    { english: 'walk', translation: 'camminare' },
  ],
  set5: [
    { english: 'red', translation: 'rosso' },
    { english: 'blue', translation: 'blu' },
    { english: 'green', translation: 'verde' },
    { english: 'yellow', translation: 'giallo' },
    { english: 'black', translation: 'nero' },
    { english: 'white', translation: 'bianco' },
    { english: 'orange', translation: 'arancione' },
    { english: 'purple', translation: 'viola' },
  ],
   set6: [
    { english: 'one', translation: 'uno' },
    { english: 'two', translation: 'due' },
    { english: 'three', translation: 'tre' },
    { english: 'four', translation: 'quattro' },
    { english: 'five', translation: 'cinque' },
    { english: 'six', translation: 'sei' },
    { english: 'seven', translation: 'sette' },
    { english: 'eight', translation: 'otto' },
  ],
  set7: [
    { english: 'dog', translation: 'cane' },
    { english: 'cat', translation: 'gatto' },
    { english: 'bird', translation: 'uccello' },
    { english: 'fish', translation: 'pesce' },
    { english: 'cow', translation: 'mucca' },
    { english: 'horse', translation: 'cavallo' },
    { english: 'lion', translation: 'leone' },
    { english: 'tiger', translation: 'tigre' },
  ],
  set8: [
    { english: 'happy', translation: 'felice' },
    { english: 'sad', translation: 'triste' },
    { english: 'angry', translation: 'arrabbiato' },
    { english: 'tired', translation: 'stanco' },
    { english: 'hungry', translation: 'affamato' },
    { english: 'thirsty', translation: 'assetato' },
    { english: 'scared', translation: 'spaventato' },
    { english: 'surprised', translation: 'sorpreso' },
  ],
  set9: [
    { english: 'big', translation: 'grande' },
    { english: 'small', translation: 'piccolo' },
    { english: 'fast', translation: 'veloce' },
    { english: 'slow', translation: 'lento' },
    { english: 'hot', translation: 'caldo' },
    { english: 'cold', translation: 'freddo' },
    { english: 'good', translation: 'buono' },
    { english: 'bad', translation: 'cattivo' },
  ],
  set10: [
    { english: 'today', translation: 'oggi' },
    { english: 'yesterday', translation: 'ieri' },
    { english: 'tomorrow', translation: 'domani' },
    { english: 'morning', translation: 'mattina' },
    { english: 'afternoon', translation: 'pomeriggio' },
    { english: 'evening', translation: 'sera' },
    { english: 'night', translation: 'notte' },
    { english: 'week', translation: 'settimana' },
  ],  */
} as const;

export const WORD_PAIRS_SET_KEYS = Object.keys(WORD_PAIR_SETS) as (keyof typeof WORD_PAIR_SETS)[];

// Vocabulary words for pronunciation practice
export const VOCABULARY_WORD_SETS = {
  consonants_th: [
    {
      id: 'th1',
      word: 'think',
      phonetic: '/θɪŋk/',
      definition: 'to use your mind to consider something',
      example: 'I think this is a good idea.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'θ'
    },
    {
      id: 'th2',
      word: 'three',
      phonetic: '/θriː/',
      definition: 'the number 3',
      example: 'I have three apples.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'θ'
    },
    {
      id: 'th3',
      word: 'thank',
      phonetic: '/θæŋk/',
      definition: 'to express gratitude',
      example: 'Thank you for your help.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'θ'
    },
    {
      id: 'th4',
      word: 'this',
      phonetic: '/ðɪs/',
      definition: 'used to indicate something near',
      example: 'This book is interesting.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'ð'
    },
    {
      id: 'th5',
      word: 'that',
      phonetic: '/ðæt/',
      definition: 'used to indicate something distant',
      example: 'That car is red.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'ð'
    }
  ],
  consonants_r: [
    {
      id: 'r1',
      word: 'red',
      phonetic: '/red/',
      definition: 'the color of blood',
      example: 'The rose is red.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r2',
      word: 'run',
      phonetic: '/rʌn/',
      definition: 'to move quickly on foot',
      example: 'I run every morning.',
      difficulty: 'easy' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r3',
      word: 'right',
      phonetic: '/raɪt/',
      definition: 'correct or the opposite of left',
      example: 'Turn right at the corner.',
      difficulty: 'medium' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r4',
      word: 'really',
      phonetic: '/ˈriːəli/',
      definition: 'truly or very much',
      example: 'I really like this song.',
      difficulty: 'medium' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    },
    {
      id: 'r5',
      word: 'around',
      phonetic: '/əˈraʊnd/',
      definition: 'in a circle or nearby',
      example: 'Walk around the park.',
      difficulty: 'medium' as const,
      soundType: 'consonant' as const,
      targetSound: 'r'
    }
  ],
  vowels_short: [
    {
      id: 'v1',
      word: 'cat',
      phonetic: '/kæt/',
      definition: 'a small domestic animal',
      example: 'The cat is sleeping.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'æ'
    },
    {
      id: 'v2',
      word: 'bed',
      phonetic: '/bed/',
      definition: 'furniture for sleeping',
      example: 'I sleep in my bed.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'e'
    },
    {
      id: 'v3',
      word: 'sit',
      phonetic: '/sɪt/',
      definition: 'to be in a seated position',
      example: 'Please sit down.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɪ'
    },
    {
      id: 'v4',
      word: 'hot',
      phonetic: '/hɒt/',
      definition: 'having high temperature',
      example: 'The coffee is hot.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɒ'
    },
    {
      id: 'v5',
      word: 'cup',
      phonetic: '/kʌp/',
      definition: 'a small container for drinking',
      example: 'I drink tea from a cup.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ʌ'
    }
  ],
  vowels_long: [
    {
      id: 'vl1',
      word: 'see',
      phonetic: '/siː/',
      definition: 'to look at with your eyes',
      example: 'I can see the mountain.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'iː'
    },
    {
      id: 'vl2',
      word: 'car',
      phonetic: '/kɑːr/',
      definition: 'a vehicle with four wheels',
      example: 'My car is blue.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɑː'
    },
    {
      id: 'vl3',
      word: 'door',
      phonetic: '/dɔːr/',
      definition: 'an entrance to a room',
      example: 'Please close the door.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɔː'
    },
    {
      id: 'vl4',
      word: 'food',
      phonetic: '/fuːd/',
      definition: 'something you eat',
      example: 'This food is delicious.',
      difficulty: 'easy' as const,
      soundType: 'vowel' as const,
      targetSound: 'uː'
    },
    {
      id: 'vl5',
      word: 'bird',
      phonetic: '/bɜːrd/',
      definition: 'an animal that can fly',
      example: 'The bird is singing.',
      difficulty: 'medium' as const,
      soundType: 'vowel' as const,
      targetSound: 'ɜː'
    }
  ],
  mixed_sounds: [
    {
      id: 'm1',
      word: 'about',
      phonetic: '/əˈbaʊt/',
      definition: 'concerning or approximately',
      example: 'Tell me about your day.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'ə'
    },
    {
      id: 'm2',
      word: 'house',
      phonetic: '/haʊs/',
      definition: 'a building where people live',
      example: 'I live in a big house.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'aʊ'
    },
    {
      id: 'm3',
      word: 'time',
      phonetic: '/taɪm/',
      definition: 'the indefinite continued progress of existence',
      example: 'What time is it?',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'aɪ'
    },
    {
      id: 'm4',
      word: 'boy',
      phonetic: '/bɔɪ/',
      definition: 'a male child',
      example: 'The boy is playing.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'ɔɪ'
    },
    {
      id: 'm5',
      word: 'here',
      phonetic: '/hɪər/',
      definition: 'in this place',
      example: 'Come here, please.',
      difficulty: 'medium' as const,
      soundType: 'mixed' as const,
      targetSound: 'ɪə'
    }
  ]
};

export const VOCABULARY_SET_KEYS = Object.keys(VOCABULARY_WORD_SETS) as (keyof typeof VOCABULARY_WORD_SETS)[];

export const ACCURACY_THRESHOLD = 70;

export const LESSON_ICONS = {
  vocabulary: 'book-open-variant',
  listening: 'headphones',
  pronunciation: 'microphone',
  roleplay: 'account-tie-voice',
  shadowing: 'account-voice-off',
  'voice_journaling': 'notebook',
  'word_pairs': 'cards-outline',
} as const;
