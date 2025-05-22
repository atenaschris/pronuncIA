import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { WORD_PAIRS } from '@/lib/constants/constants';
import { ColumnType, EnglishWord, TranslationWord } from '@/lib/types/types';
import { useTheme } from '@rneui/themed';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
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
  
  // Animation values
  const scaleAnimation = useSharedValue(1);
  
  // Sound effects using expo-audio
  const correctSound = useAudioPlayer(require('../../assets/sounds/correct.mp3'));
  const incorrectSound = useAudioPlayer(require('../../assets/sounds/incorrect.mp3'));
  
  // Helper functions - defined before they're used
  const isSelected = useCallback((index: number, column: ColumnType) => {
    return selectedPair?.index === index && selectedPair?.column === column;
  }, [selectedPair]);

  const isMatched = useCallback((index: number) => {
    return matchedPairs.includes(index);
  }, [matchedPairs]);
  
  // Pre-compute animated styles for all possible items
  const englishAnimatedStyles = WORD_PAIRS.map((_, index) => {
    const scale = isSelected(index, 'english') ? scaleAnimation.value : 1
    return useAnimatedStyle(() => ({
      transform: [{ scale }]
    }));
  });
  
  const translationAnimatedStyles = WORD_PAIRS.map((_, index) => {
    const scale = isSelected(index, 'translation') ? scaleAnimation.value : 1
    return useAnimatedStyle(() => ({
      transform: [{ scale  }]
    }));
  });

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
  };

  const handleWordPress = (index: number, column: ColumnType) => {
    // Trigger a small scale animation
    scaleAnimation.value = withSpring(1.05, { damping: 10 });
    setTimeout(() => {
      scaleAnimation.value = withSpring(1);
    }, 150);
    
    // If the word is already matched, do nothing
    if (matchedPairs.includes(index) && column === 'english') {
      return;
    }
    
    // If no word is selected yet
    if (!selectedPair) {
      setSelectedPair({ index, column });
      return;
    }
    
    // If clicking the same column, just update the selection
    if (selectedPair.column === column) {
      setSelectedPair({ index, column });
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      correctSound.play();
      
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
        }, 1000);
      }
    } else {
      // Incorrect match
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      incorrectSound.play();
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
    
    if (isSelected(index, column)) {
      return [styles.wordCell, styles.selectedCell, themeStyles.wordCell, themeStyles.selectedCell];
    }
    
    return [styles.wordCell, themeStyles.wordCell];
  }, [isMatched, isSelected, isTranslationMatched, themeStyles]);
  
  const getWordTextStyle = useCallback((index: number, column: ColumnType) => {
    const isWordMatched = 
      (column === 'english' && isMatched(index)) ||
      (column === 'translation' && isTranslationMatched(index));
    
    if (isWordMatched) {
      return [styles.wordText, themeStyles.matchedText];
    }
    
    if (isSelected(index, column)) {
      return [styles.wordText, themeStyles.selectedText];
    }
    
    return [styles.wordText, themeStyles.wordText];
  }, [isMatched, isSelected, isTranslationMatched, themeStyles]);

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
                style={[getWordCellStyle(index, 'english'), englishAnimatedStyles]} 
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
                style={[getWordCellStyle(index, 'translation'), translationAnimatedStyles]} 
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