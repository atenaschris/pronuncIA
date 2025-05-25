import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { WORD_PAIRS } from '@/lib/constants/constants';
import { useHaptic } from '@/lib/hooks/use-haptic';
import { ColumnType, EnglishWord, TranslationWord } from '@/lib/types/word-pairs';
import { useTheme } from '@rneui/themed';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';


const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function WordPairsScreen() {
  // All hooks must be called at the top level, before any conditional logic
  const { theme } = useTheme();
  const [englishWords, setEnglishWords] = useState<EnglishWord[]>([]);
  const [translationWords, setTranslationWords] = useState<TranslationWord[]>([]);
  const [selectedPair, setSelectedPair] = useState<{index: number, column: ColumnType} | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [incorrectPair, setIncorrectPair] = useState<{ english: number; translation: number } | null>(null);
  const HapticSuccess = useHaptic('success');
  const HapticError = useHaptic('error');
  
  // Animation values - individual scale values for each item
  const englishScaleValues = [
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
  ];
  const translationScaleValues = [
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
  ];
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound effects using expo-av
  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [incorrectSound, setIncorrectSound] = useState<Audio.Sound | null>(null);
  const [winningSound, setWinningSound] = useState<Audio.Sound | null>(null);

  // Load audio files
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const { sound: correct } = await Audio.Sound.createAsync(
          require('../../assets/sounds/correct.mp3')
        );
        const { sound: incorrect } = await Audio.Sound.createAsync(
          require('../../assets/sounds/incorrect.mp3')
        );
        const { sound: winning } = await Audio.Sound.createAsync(
          require('../../assets/sounds/win.mp3')
        );
        
        setCorrectSound(correct);
        setIncorrectSound(incorrect);
        setWinningSound(winning);
      } catch (error) {
        console.warn('Failed to load audio files:', error);
      }
    };

    loadAudio();

    // Cleanup function
    return () => {
      correctSound?.unloadAsync();
      incorrectSound?.unloadAsync();
      winningSound?.unloadAsync();
    };
  }, []);
  
  // Helper functions - defined before they're used
  const isSelected = useCallback((index: number, column: ColumnType) => {
    return selectedPair?.index === index && selectedPair?.column === column;
  }, [selectedPair]);

  const isMatched = useCallback((index: number) => {
    return matchedPairs.includes(index);
  }, [matchedPairs]);
  
  // Create individual animated styles for each item (fixed number of hooks)
  const englishAnimatedStyle0 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[0].value }] }));
  const englishAnimatedStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[1].value }] }));
  const englishAnimatedStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[2].value }] }));
  const englishAnimatedStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[3].value }] }));
  const englishAnimatedStyle4 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[4].value }] }));
  const englishAnimatedStyle5 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[5].value }] }));
  const englishAnimatedStyle6 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[6].value }] }));
  const englishAnimatedStyle7 = useAnimatedStyle(() => ({ transform: [{ scale: englishScaleValues[7].value }] }));
  
  const translationAnimatedStyle0 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[0].value }] }));
  const translationAnimatedStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[1].value }] }));
  const translationAnimatedStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[2].value }] }));
  const translationAnimatedStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[3].value }] }));
  const translationAnimatedStyle4 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[4].value }] }));
  const translationAnimatedStyle5 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[5].value }] }));
  const translationAnimatedStyle6 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[6].value }] }));
  const translationAnimatedStyle7 = useAnimatedStyle(() => ({ transform: [{ scale: translationScaleValues[7].value }] }));

  // Arrays of animated styles for easier access
  const englishAnimatedStyles = [
    englishAnimatedStyle0, englishAnimatedStyle1, englishAnimatedStyle2, englishAnimatedStyle3,
    englishAnimatedStyle4, englishAnimatedStyle5, englishAnimatedStyle6, englishAnimatedStyle7,
  ];
  const translationAnimatedStyles = [
    translationAnimatedStyle0, translationAnimatedStyle1, translationAnimatedStyle2, translationAnimatedStyle3,
    translationAnimatedStyle4, translationAnimatedStyle5, translationAnimatedStyle6, translationAnimatedStyle7,
  ];
  
  // Helper function to get the correct animated style
  const getEnglishAnimatedStyle = (index: number) => {
    return englishAnimatedStyles[index] || englishAnimatedStyles[0]; // Default to first if out of bounds
  };
  
  const getTranslationAnimatedStyle = (index: number) => {
    return translationAnimatedStyles[index] || translationAnimatedStyles[0]; // Default to first if out of bounds
  };

  // Initialize the game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Extract and shuffle words
    const english = WORD_PAIRS.map(pair => pair.english);
    const translations = WORD_PAIRS.map(pair => pair.translation);
    
    // Shuffle the translations
    const shuffledTranslations = [...translations].sort(() => Math.random() - 0.5);
    
    setEnglishWords(english);
    setTranslationWords(shuffledTranslations);
    setSelectedPair(null);
    setMatchedPairs([]);
    setScore(0);
    setIncorrectPair(null);
  };

  const handleWordPress = (index: number, column: ColumnType) => {
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // Get the appropriate scale value for this specific item
    const scaleValue = column === 'english' ? englishScaleValues[index] : translationScaleValues[index];
    
    // Trigger a small scale animation for this specific item
    scaleValue.value = withSpring(1.10, { damping: 10 });
    animationTimeoutRef.current = setTimeout(() => {
      scaleValue.value = withSpring(1);
    }, 50);
    
    // If the word is already matched, do nothing
    if (matchedPairs.includes(index) && column === 'english') {
      return;
    }
    
    // If no word is selected yet
    if (!selectedPair) {
      setSelectedPair({ index, column });
      setIncorrectPair(null); // Clear incorrect pair on new selection
      return;
    }
    
    // If clicking the same column, just update the selection
    if (selectedPair.column === column) {
      setSelectedPair({ index, column });
      setIncorrectPair(null); // Clear incorrect pair on new selection
      return;
    }
    
    // Check if the pair matches
    const englishIndex = column === 'english' ? index : selectedPair.index;
    const translationIndex = column === 'translation' ? index : selectedPair.index;
    
    const englishWord = englishWords[englishIndex];
    const translationWord = translationWords[translationIndex];
    
    // Find if this is a correct match
    const correctTranslation = WORD_PAIRS.find(pair => pair.english === englishWord)?.translation;
    
    if (translationWord === correctTranslation) {
      // Correct match
      HapticSuccess?.();
      correctSound?.replayAsync()
      
      setMatchedPairs(prev => [...prev, englishIndex]);
      setScore(prev => prev + 10);
      
      // Check if all pairs are matched
      if (matchedPairs.length + 1 === WORD_PAIRS.length) {
        setTimeout(() => {
          Alert.alert(
            "Congratulations!",
            `You've completed the exercise with a score of ${score + 10}!`,
            [{ text: "Play Again", onPress: initializeGame }]
          );
        }, 300);
        winningSound?.replayAsync();
      }
    } else {
      // Incorrect match
      HapticError?.();
      incorrectSound?.replayAsync()
      setIncorrectPair({ 
        english: column === 'english' ? index : selectedPair.index, 
        translation: column === 'translation' ? index : selectedPair.index 
      });
      setScore(prev => prev !== 0 ?  prev - 10 : 0);
      setTimeout(() => setIncorrectPair(null), 500); // Clear after 1 second
    }
    
    // Reset selection
    setSelectedPair(null);
  };

  // Create theme-based styles
  const themeStyles = {
    wordCell: {
      backgroundColor: theme.colors.grey5,
      shadowColor: theme.colors.black,
    },
    selectedCell: {
      backgroundColor: theme.colors.primary + '20', // Adding transparency
      borderColor: theme.colors.primary,
    },
    matchedCell: {
      backgroundColor: theme.colors.success + '20', // Adding transparency
      borderColor: theme.colors.success,
    },
    incorrectCell: {
      backgroundColor: theme.colors.error + '20',
      borderColor: theme.colors.error,
    },
    wordText: {
      color: theme.colors.black,
    },
    selectedText: {
      color: theme.colors.primary,
      fontWeight: '700' as const,
    },
    matchedText: {
      color: theme.colors.success,
      fontWeight: '700' as const,
    },
    incorrectText: {
      color: theme.colors.error,
      fontWeight: '700' as const,
    },
    resetButton: {
      backgroundColor: theme.colors.primary,
    },
    resetButtonText: {
      color: theme.colors.white,
    }
  };

  // Helper function to check if a translation word is matched
  const isTranslationMatched = useCallback((translationIndex: number) => {
    return matchedPairs.some(englishIndex => {
      const englishWord = englishWords[englishIndex];
      const correctTranslation = WORD_PAIRS.find(pair => pair.english === englishWord)?.translation;
      return correctTranslation === translationWords[translationIndex];
    });
  }, [matchedPairs, englishWords, translationWords]);

  // Memoize style functions to ensure consistent hook calls
  const getWordCellStyle = useCallback((index: number, column: ColumnType) => {
    const isWordMatched = 
      (column === 'english' && isMatched(index)) ||
      (column === 'translation' && isTranslationMatched(index));
    
    if (isWordMatched) {
      return [styles.wordCell, styles.matchedCell, themeStyles.wordCell, themeStyles.matchedCell];
    }

    if (incorrectPair && 
        ((column === 'english' && incorrectPair.english === index) || 
         (column === 'translation' && incorrectPair.translation === index))) {
      return [styles.wordCell, styles.incorrectCell, themeStyles.wordCell, themeStyles.incorrectCell];
    }
    
    if (isSelected(index, column)) {
      return [styles.wordCell, styles.selectedCell, themeStyles.wordCell, themeStyles.selectedCell];
    }
    
    return [styles.wordCell, themeStyles.wordCell];
  }, [isMatched, isSelected, isTranslationMatched, themeStyles, incorrectPair]);
  
  const getWordTextStyle = useCallback((index: number, column: ColumnType) => {
    const isWordMatched = 
      (column === 'english' && isMatched(index)) ||
      (column === 'translation' && isTranslationMatched(index));
    
    if (isWordMatched) {
      return [styles.wordText, themeStyles.matchedText];
    }

    if (incorrectPair && 
        ((column === 'english' && incorrectPair.english === index) || 
         (column === 'translation' && incorrectPair.translation === index))) {
      return [styles.wordText, themeStyles.incorrectText];
    }
    
    if (isSelected(index, column)) {
      return [styles.wordText, themeStyles.selectedText];
    }
    
    return [styles.wordText, themeStyles.wordText];
  }, [isMatched, isSelected, isTranslationMatched, themeStyles, incorrectPair]);

  return (
    <RNESafeAreaView style={styles.container}>
      <RNEView style={styles.header}>
        <OnboardingTitle>Match the Pairs</OnboardingTitle>
        <OnboardingSubtitle>Tap the matching word pairs</OnboardingSubtitle>
        <RNEText style={styles.scoreText}>Score: {score}</RNEText>
      </RNEView>
      
      <RNEView style={styles.gameContainer}>
        <RNEView style={styles.column}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {englishWords.map((word, index) => (
              <AnimatedTouchable
                key={`english-${index}`}
                style={[getWordCellStyle(index, 'english'), getEnglishAnimatedStyle(index)]} 
                onPress={() => handleWordPress(index, 'english')}
                disabled={isMatched(index)}
              >
                <RNEText style={getWordTextStyle(index, 'english')}>{word}</RNEText>
              </AnimatedTouchable>
            ))}
          </ScrollView>
        </RNEView>
        
        <RNEView style={styles.column}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {translationWords.map((word, index) => (
              <AnimatedTouchable
                key={`translation-${index}`}
                style={[getWordCellStyle(index, 'translation'), getTranslationAnimatedStyle(index)]} 
                onPress={() => handleWordPress(index, 'translation')}
              >
                <RNEText style={getWordTextStyle(index, 'translation')}>{word}</RNEText>
              </AnimatedTouchable>
            ))}
          </ScrollView>
        </RNEView>
      </RNEView>
      <NextButton 
        onPress={initializeGame}
      >
        <RNEText style={[styles.resetButtonText, themeStyles.resetButtonText]}>Reset Game</RNEText>
      </NextButton>
    </RNESafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
  },
  wordCell: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedCell: {
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  incorrectCell: {
    borderWidth: 2,
  },
  matchedCell: {
    borderWidth: 2,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    padding: 15,
    margin: 20,
    borderRadius: 30,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});