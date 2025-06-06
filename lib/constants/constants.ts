
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
  ], */
  /* set6: [
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
  ], */
} as const;

export const WORD_PAIRS_SET_KEYS = Object.keys(WORD_PAIR_SETS) as (keyof typeof WORD_PAIR_SETS)[];


export const LESSON_ICONS = {
  vocabulary: 'book-open-variant',
  listening: 'headphones',
  pronunciation: 'microphone',
  roleplay: 'account-tie-voice',
  shadowing: 'account-voice-off',
  'voice_journaling': 'notebook',
  'word_pairs': 'cards-outline',
} as const;
