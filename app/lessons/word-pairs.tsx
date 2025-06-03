import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { WORD_PAIR_SETS, WORD_PAIRS_SET_KEYS } from '@/lib/constants/constants';
import { useAudio } from '@/lib/hooks/use-audio';
import { useHaptic } from '@/lib/hooks/use-haptic';
import { ColumnType } from '@/lib/types/word-pairs';
import { useTheme } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LessonType, useLessonStore } from '../../lib/store/lesson-store';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';


const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function WordPairsScreen() {
  // All hooks must be called at the top level, before any conditional logic
  const { theme } = useTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: LessonType }>();
  const {
    completeLesson,
    dailyPlan,
    initializeLessonSessionState,
    getWordPairsState,
    setEnglishWords,
    setTranslationWords,
    setSelectedPair,
    setMatchedPairs,
    setScore,
    setIncorrectPair,
    setLessonCompleted,
    setCurrentSetIndex,
    setMadeError,
    addErrorDetail,
    clearCurrentSetErrors,
    resetWordPairsLesson,
  } = useLessonStore();

  // Initialize the lesson session state if needed
  useEffect(() => {
    if (lessonId) {
      initializeLessonSessionState(lessonId, 'word_pairs');
    }
  }, [lessonId, initializeLessonSessionState]);
  // Get the current word pairs state for this specific lesson
  const wordPairsState = lessonId ? getWordPairsState(lessonId) : null;

  // Destructure word-pairs state for easier access
  const {
    englishWords = [],
    translationWords = [],
    selectedPair = null,
    matchedPairs = [],
    score = 0,
    incorrectPair = null,
    lessonCompleted = false,
    currentSetIndex = 0,
    madeError = false,
    errorDetails
  } = wordPairsState || {};

  console.log('------------->', wordPairsState)

  const HapticSuccess = useHaptic('success');
  const HapticError = useHaptic('error');
  // lessonId is already declared above, removing duplicate
  const { correctSound, incorrectSound, winningSound } = useAudio();
  
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
  
  const initializeGame = useCallback(() => {
    if (!lessonId || !setEnglishWords || !setTranslationWords) return;
    const currentSetKey = WORD_PAIRS_SET_KEYS[currentSetIndex];
    const currentWordPairs = WORD_PAIR_SETS[currentSetKey];
    // Extract and shuffle words
    const english = currentWordPairs.map(pair => pair.english);
    const translations = currentWordPairs.map(pair => pair.translation);
    
    // Shuffle the translations
    const shuffledTranslations = [...translations].sort(() => Math.random() - 0.5);
    
    setEnglishWords(lessonId, english);
    setTranslationWords(lessonId, shuffledTranslations);
    setSelectedPair(lessonId, null);
    setMatchedPairs(lessonId, []);
    setScore(lessonId, 0);
    setIncorrectPair(lessonId, null);
    setLessonCompleted(lessonId, false); // Reset lesson completed state
    setMadeError(lessonId, false); // Reset error tracking for the new game
    // Note: We don't automatically clear errors here anymore to preserve error history
    if (animationTimeoutRef.current) { // Clear any existing animation timeout reference on initiGame
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, [lessonId, currentSetIndex, setEnglishWords, setTranslationWords, setSelectedPair, setMatchedPairs, setScore, setIncorrectPair, setLessonCompleted, setMadeError]);

  // Initialize the game
  useEffect(() => {
    if (lessonId) {
      initializeGame();
    }
  }, [currentSetIndex, lessonId, initializeGame]); // Re-initialize when currentSetIndex or lessonId changes


  const handleWordPress = (index: number, column: ColumnType) => {
    if (!lessonId) return;
    
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
      setSelectedPair?.(lessonId, { index, column });
      setIncorrectPair?.(lessonId, null); // Clear incorrect pair on new selection
      return;
    }
    
    // If clicking the same column, just update the selection
    if (selectedPair.column === column) {
      setSelectedPair(lessonId, { index, column });
      setIncorrectPair(lessonId, null); // Clear incorrect pair on new selection
      return;
    }
    
    // Check if the pair matches
    const englishIndex = column === 'english' ? index : selectedPair.index;
    const translationIndex = column === 'translation' ? index : selectedPair.index;
    
    const englishWord = englishWords[englishIndex];
    const translationWord = translationWords[translationIndex];
    
    // Find if this is a correct match
    const currentSetKey = WORD_PAIRS_SET_KEYS[currentSetIndex];
    const currentWordPairs = WORD_PAIR_SETS[currentSetKey];
    const correctTranslation = currentWordPairs.find(pair => pair.english === englishWord)?.translation;
    
    if (translationWord === correctTranslation) {
      // Correct match
      HapticSuccess?.();
      correctSound?.replayAsync()
      
      setMatchedPairs(lessonId, [...matchedPairs, englishIndex]);
      setScore(lessonId, score + 10);
      
      // Check if all pairs are matched
      const currentSetKey = WORD_PAIRS_SET_KEYS[currentSetIndex];
      const currentWordPairs = WORD_PAIR_SETS[currentSetKey];
      if (matchedPairs.length + 1 === currentWordPairs.length && !lessonCompleted) {
        const finalScore = score + 10; // Calculate final score before calling completeLesson
        if (lessonId) {
          // Pass the score for the current set and the current set's index
          console.log('Before completeLesson - Current Set Score:', finalScore, 'Set Index:', currentSetIndex);
          completeLesson(lessonId, finalScore, currentSetIndex);
          // Fetch the updated lesson state to display accumulated XP
          const updatedLessonState = useLessonStore.getState().dailyPlan?.lessons.find(l => l.id === lessonId);
          console.log('After completeLesson - Accumulated Lesson XP:', updatedLessonState?.xpReward);
          setLessonCompleted(lessonId, true); // Mark lesson as completed
        }
        setTimeout(() => {
          const updatedWPLesson = useLessonStore.getState().dailyPlan?.lessons.find(l => l.id === lessonId);
          const accumulatedLessonXP = updatedWPLesson?.xpReward || 0;
          const allSetsAttempted = (updatedWPLesson?.completedSets || 0) >= (updatedWPLesson?.totalSets || WORD_PAIRS_SET_KEYS.length);

          let alertTitle = "Set Complete!";
          let alertMessage = `You scored ${finalScore} for this set.`;
          const alertButtons = [];
          
          if (allSetsAttempted) {
            alertTitle = "All Sets Mastered!";
            alertMessage = `You've completed all sets! Your total XP for this lesson is ${accumulatedLessonXP}.`;
            if (errorDetails && errorDetails.totalErrors > 0) {
              // Group errors by set index
              const errorsBySet = errorDetails.incorrectMatches.reduce((acc, error) => {
                if (!acc[error.setIndex]) acc[error.setIndex] = [];
                acc[error.setIndex].push(error);
                return acc;
              }, {} as Record<number, typeof errorDetails.incorrectMatches>);
              
              const setCount = Object.keys(errorsBySet).length;
              alertMessage += `\n\n⚠️ You made ${errorDetails.totalErrors} error(s) across ${setCount} set(s). Here's a breakdown:`;
              
              Object.entries(errorsBySet).forEach(([setIdx, errors]) => {
                alertMessage += `\n\n📍 Set ${parseInt(setIdx) + 1} (${errors.length} error${errors.length > 1 ? 's' : ''}):`;  
                errors.forEach(error => {
                  alertMessage += `\n• "${error.englishWord}" ≠ "${error.attemptedTranslation}"`;  
                });
              });
              
              alertMessage += `\n\nYou can replay specific sets to fix these errors and earn additional XP!`;
            } else {
              // All errors have been fixed!
              alertMessage += `\n\n🎉 Perfect! You've mastered all sets with no errors remaining!`;
            }
          } else {
            // Not all sets are completed yet
            alertMessage += ` Your current total XP for this lesson is ${accumulatedLessonXP}.`;
            if (errorDetails && errorDetails.incorrectMatches.length > 0) {
               const currentSetErrors = errorDetails.incorrectMatches.filter(error => 
                 error.setIndex === currentSetIndex
               );
               if (currentSetErrors.length > 0) {
                 alertMessage += `\n\n❌ Errors in this set:`;
                 currentSetErrors.forEach(error => {
                   alertMessage += `\n• "${error.englishWord}" ≠ "${error.attemptedTranslation}"`;
                 });
                 alertMessage += `\n\nTry this set again for a perfect score, or move to the next one.`;
               }
             }
            alertButtons.push({
              text: "Next Set",
              onPress: () => {
                setCurrentSetIndex?.(lessonId, currentSetIndex + 1);
                // initializeGame will be called by useEffect
              }
            });
          }
          if(!allSetsAttempted || (allSetsAttempted && !errorDetails?.totalErrors)) {
            // Enhanced button text for "Play This Set Again"
            const replayButtonText = madeError ? "🔄 Replay Set (Fix Errors)" : "🔄 Play This Set Again";
            alertButtons.push({ 
              text: replayButtonText, 
              onPress: () => {
                if (madeError) {
                  clearCurrentSetErrors(lessonId, currentSetIndex); // Clear errors when explicitly fixing
                }
                initializeGame();
              }
            });
          }    
          // Add buttons for sets with errors (only when all sets are completed)
          if (allSetsAttempted && errorDetails && errorDetails.totalErrors > 0) {
            const errorsBySet = errorDetails.incorrectMatches.reduce((acc, error) => {
              if (!acc[error.setIndex]) acc[error.setIndex] = [];
              acc[error.setIndex].push(error);
              return acc;
            }, {} as Record<number, typeof errorDetails.incorrectMatches>);
            
            Object.keys(errorsBySet).forEach(setIdx => {
              const setIndex = parseInt(setIdx);
              const errorCount = errorsBySet[setIndex].length;
              alertButtons.push({
                text: `🎯 Fix Set ${setIndex + 1} (${errorCount} error${errorCount > 1 ? 's' : ''})`,
                onPress: () => {
                  clearCurrentSetErrors(lessonId, setIndex); // Clear errors for this specific set
                  setMadeError(lessonId, false); // Reset error flag for fresh tracking
                  setLessonCompleted(lessonId, false); // Reset lesson completed state when fixing a specific set
                  if (currentSetIndex === setIndex) {
                    // If we're already on this set, force re-initialization
                    initializeGame();
                  } else {
                    setCurrentSetIndex?.(lessonId, setIndex);
                    // initializeGame will be called by useEffect when currentSetIndex changes
                  }
                }
              });
            });
          }
          
          // Only show "Start From Scratch" if all sets are completed
          if (allSetsAttempted) {
            alertButtons.push({ 
              text: "🔄 Start From Scratch", 
              onPress: () => {
                Alert.alert(
                  "Start From Scratch?",
                  "This will reset ALL progress for this lesson. Your global XP and streak will be adjusted accordingly. Are you sure?",
                  [
                    { text: "Cancel and Go to the lessons page", style: "cancel",  onPress: () => router.replace("/(tabs)") },
                    { 
                      text: "Reset Lesson", 
                      style: "destructive",
                      onPress: () => {
                        resetWordPairsLesson(lessonId);
                        initializeGame();
                      }
                    }
                  ]
                );
              }
            });
          }
          
          // Only show "Go Back" with save progress modal if there are still errors or not all sets completed
          if (!allSetsAttempted || (errorDetails && errorDetails.totalErrors > 0)) {
            alertButtons.push({
              text: "🏠 Go Back", 
              onPress: () => {
                Alert.alert(
                  "Save Progress?",
                  "Your overall lesson progress is automatically saved, along with the current score for this set! 💾\n\nBy the way, you will have to play it again in order to move on, make sure you read carefully the words, otherwise you could score lower\n\nGo back to main menu?",
                  [
                    { text: "Next Set", style: "cancel",  onPress: () => setCurrentSetIndex?.(lessonId, currentSetIndex + 1) },
                    { text: "Go Back", onPress: () => {
                      // Clear current set errors when leaving to prevent accumulation
                      clearCurrentSetErrors(lessonId, currentSetIndex);
                      router.replace("/(tabs)");
                    }}
                  ]
                );
              }
            });
          } else {
            // All sets completed with no errors - show simple go back option
            alertButtons.push({
              text: "🏠 Return to Lessons", 
              onPress: () => router.replace("/(tabs)")
            });
          }
          Alert.alert(alertTitle, alertMessage, alertButtons);
        }, 300);
        winningSound?.replayAsync();
      }
    } else {
      // Incorrect match
      HapticError?.();
      incorrectSound?.replayAsync()
      setMadeError(lessonId, true); // Mark that an error was made
      
      // Track detailed error information
       addErrorDetail(lessonId, englishWord, translationWord, correctTranslation || '', currentSetIndex);
      
      setIncorrectPair(lessonId, { 
        english: column === 'english' ? index : selectedPair.index, 
        translation: column === 'translation' ? index : selectedPair.index 
      });
      setScore(lessonId, score - 10);
      setTimeout(() => setIncorrectPair(lessonId, null), 500); // Clear after 1 second
    }
    
    // Reset selection
    setSelectedPair(lessonId, null);
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
    const currentSetKey = WORD_PAIRS_SET_KEYS[currentSetIndex];
    const currentWordPairs = WORD_PAIR_SETS[currentSetKey];
    return matchedPairs.some(englishIndex => {
      const englishWord = englishWords[englishIndex];
      const correctTranslation = currentWordPairs.find(pair => pair.english === englishWord)?.translation;
      return correctTranslation === translationWords[translationIndex];
    });
  }, [matchedPairs, englishWords, translationWords, currentSetIndex]);

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
        onPress={() => {
          resetWordPairsLesson(lessonId!);
          initializeGame();
        }}
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