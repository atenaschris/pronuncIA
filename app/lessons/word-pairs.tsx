import { ProgressStepper } from '@/app/lessons/components/wordpairs/ProgressStepper';
import { NextButton } from '@/components/ui/NextButton';
import { PortalModal } from '@/components/ui/portal';

import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { useAudio } from '@/lib/hooks/use-audio';
import { useHaptic } from '@/lib/hooks/use-haptic';
import { usePortalModalStore } from '@/lib/store/portal-modal-store';
import { ColumnType, WordPairsState } from '@/lib/types/word-pairs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LessonType, useLessonStore } from '../../lib/store/lesson-store';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function WordPairsScreen() {
  // All hooks must be called at the top level, before any conditional logic
  const theme = useAppTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: LessonType }>();
  const {
    completeLesson,
    initializeLessonSessionState,
    setEnglishWords,
    setTranslationWords,
    setSelectedPair,
    setMatchedPairs,
    setScore,
    setIncorrectPair,
    setCurrentSetCompleted,
    setCurrentSetIndex,
    addErrorDetail,
    clearCurrentSetErrors,
    resetWordPairsLesson,
    startSetTimer,
    stopSetTimer,
    updateCurrentSetElapsedTime,
    clearSetTimer,
    addTimeBonusXP,
    pauseSetTimer,
    resumeSetTimer,
    setIsReplayingForErrors,
    setIsGoingBack,
    generateWordPairsContent,
  } = useLessonStore();

  // Initialize the lesson session state if needed
  useEffect(() => {
    if (lessonId) {
      initializeLessonSessionState(lessonId, 'word_pairs');
    }
  }, [lessonId, initializeLessonSessionState]);
  // Get the whole lesson object for access to both lesson data and session state
  // Access dailyPlan directly from store to ensure reactivity
  const dailyPlan = useLessonStore(state => state.dailyPlan);
  const currentLesson = lessonId && dailyPlan ? dailyPlan.lessons.find(l => l.id === lessonId) : null;
  const wordPairsState = (currentLesson?.sessionState as WordPairsState) || null;

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
    errorDetails,
    setTimers = [],
    currentSetStartTime = null,
    currentSetElapsedTime = 0,
    totalSessionTime = 0,
    isPaused = false,
    pauseCount = 0,
    isReplayingForErrors = false,
    isGoingBack = false,
  } = wordPairsState || {};

  // Portal Modal management
  const { visible: modalVisible, content: modalContent, modalId, showModal, hideModal } = usePortalModalStore();

  // State for dynamic word pairs content
  const [dynamicWordPairs, setDynamicWordPairs] = React.useState<Record<string, Array<{ english: string; translation: string }>>>({});
  const [isLoadingContent, setIsLoadingContent] = React.useState(false);

  // Calculate total sets from dynamic content
  const totalSets = useMemo(() => {
    // Use planned total sets from lesson metadata; do NOT derive from loaded content
    return (currentLesson?.totalSets ?? 10);
  }, [currentLesson?.totalSets]);

  const HapticSuccess = useHaptic('success');
  const HapticError = useHaptic('error');
  // lessonId is already declared above, removing duplicate
  const { correctSound, incorrectSound, winningSound } = useAudio();

  // Animation values - individual scale values for each word pair 
  const englishScaleValues = [
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
  ];
  const translationScaleValues = [
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
    useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1),
  ];
  const animationTimeoutRef = useRef<number | null>(null);
  // Memoized ProgressStepper props for performance optimization
  const completedSteps = useMemo(() => {
    console.log('calculated completedSteps')
    if (!currentLesson?.setBestScores) return [];
    
    // Only mark sets as completed if they have a recorded score > 0
    return currentLesson.setBestScores
      .map((score, index) => ({ score, index }))
      .filter(({ score }) => score > 0)
      .map(({ index }) => index);
  }, [currentLesson?.setBestScores]);

  const stepsWithErrors = useMemo(() => {
    console.log('calculated stepsWithErrors')
    return errorDetails?.incorrectMatches ?
      [...new Set(errorDetails.incorrectMatches.map(error => error.setIndex))] : [];
  }, [errorDetails?.incorrectMatches]);

  // Helper functions - defined before they're used
  const isSelected = useCallback((index: number, column: ColumnType) => {
    return selectedPair?.index === index && selectedPair?.column === column;
  }, [selectedPair]);

  const isMatched = useCallback((index: number) => {
    return matchedPairs?.includes(index) ?? false;
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

  // Memoize arrays of animated styles for easier access
  const englishAnimatedStyles = useMemo(() => [
    englishAnimatedStyle0, englishAnimatedStyle1, englishAnimatedStyle2, englishAnimatedStyle3,
    englishAnimatedStyle4, englishAnimatedStyle5, englishAnimatedStyle6, englishAnimatedStyle7,
  ], [englishAnimatedStyle0, englishAnimatedStyle1, englishAnimatedStyle2, englishAnimatedStyle3,
    englishAnimatedStyle4, englishAnimatedStyle5, englishAnimatedStyle6, englishAnimatedStyle7]);

  const translationAnimatedStyles = useMemo(() => [
    translationAnimatedStyle0, translationAnimatedStyle1, translationAnimatedStyle2, translationAnimatedStyle3,
    translationAnimatedStyle4, translationAnimatedStyle5, translationAnimatedStyle6, translationAnimatedStyle7,
  ], [translationAnimatedStyle0, translationAnimatedStyle1, translationAnimatedStyle2, translationAnimatedStyle3,
    translationAnimatedStyle4, translationAnimatedStyle5, translationAnimatedStyle6, translationAnimatedStyle7]);

  // Memoize helper functions to get the correct animated style
  const getEnglishAnimatedStyle = useCallback((index: number) => {
    return englishAnimatedStyles[index] || englishAnimatedStyles[0]; // Default to first if out of bounds
  }, [englishAnimatedStyles]);

  const getTranslationAnimatedStyle = useCallback((index: number) => {
    return translationAnimatedStyles[index] || translationAnimatedStyles[0]; // Default to first if out of bounds
  }, [translationAnimatedStyles]);

  // Memoize current word pairs to avoid redundant calculations
  const currentWordPairs = useMemo(() => {
    // Get the current set's word pairs based on currentSetIndex
    const setKey = `set${currentSetIndex + 1}`;
    return dynamicWordPairs[setKey] || [];
  }, [dynamicWordPairs, currentSetIndex]);

  const initializeGame = useCallback(async () => {
    if (!lessonId) return;
    
    // Generate dynamic content if not already loaded
    if (Object.keys(dynamicWordPairs).length === 0 && !isLoadingContent) {
      setIsLoadingContent(true);
      try {
        const generatedPairs = await generateWordPairsContent(lessonId || 'word-pairs');
        setDynamicWordPairs(generatedPairs);
      } catch (error) {
        console.error('Failed to generate word pairs content:', error);
        // Fallback to empty object - could show error message to user
        setDynamicWordPairs({});
      } finally {
        setIsLoadingContent(false);
      }
      return; // Exit early, useEffect will re-run when dynamicWordPairs updates
    }

    if (currentWordPairs.length === 0) return; // Don't initialize if no content

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
    setCurrentSetCompleted(lessonId, false); // Reset lesson completed state
    if (animationTimeoutRef.current) { // Clear any existing animation timeout reference on initiGame
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // Clear the timer for the current set when replaying
    clearSetTimer(lessonId, currentSetIndex);

    // Start the timer for this set
    startSetTimer(lessonId);
  }, [lessonId, currentSetIndex, currentWordPairs, dynamicWordPairs, isLoadingContent, generateWordPairsContent, setEnglishWords, setTranslationWords, setSelectedPair, setMatchedPairs, setScore, setIncorrectPair, setCurrentSetCompleted, clearSetTimer, startSetTimer, pauseSetTimer, resumeSetTimer]);

  // Initialize the game
  useEffect(() => {
    if (lessonId) {
      initializeGame();
    }
  }, [currentSetIndex, lessonId, initializeGame, dynamicWordPairs]); // Re-initialize when currentSetIndex, lessonId, or dynamicWordPairs changes

  // Reset replay state when set index changes (unless we're in the middle of a replay)
  useEffect(() => {
    // Only reset if we're not currently in a replay session
    if (!isReplayingForErrors) {
      setIsReplayingForErrors(lessonId!, false);
    }
  }, [currentSetIndex, lessonId]);

  // Timer update effect - updates the elapsed time every second
  useEffect(() => {
    if (!lessonId || !currentSetStartTime) return;

    const interval = setInterval(() => {
      updateCurrentSetElapsedTime(lessonId);
    }, 1000);

    return () => clearInterval(interval);
  }, [lessonId, currentSetStartTime, updateCurrentSetElapsedTime]);

  // Cleanup effect - handle component unmount when timer is paused
  useEffect(() => {
    return () => {
      // If the component unmounts while the timer is paused, resume it to prevent negative timer issues
      if (lessonId && isPaused && currentSetStartTime) {
        resumeSetTimer(lessonId);
      }
    };
  }, [lessonId, isPaused, currentSetStartTime, resumeSetTimer]);

  // Memoize bonus XP calculation for performance
  const calculateTimeBonusXP = useCallback((totalTimeInSeconds: number, totalSets: number): { bonusXP: number; timeCategory: string } => {
    const averageTimePerSet = totalTimeInSeconds / totalSets;

    // Time thresholds (in seconds per set)
    if (averageTimePerSet <= 30) {
      return { bonusXP: 50, timeCategory: 'Lightning Fast' }; // Under 30 seconds per set
    } else if (averageTimePerSet <= 45) {
      return { bonusXP: 30, timeCategory: 'Very Fast' }; // 30-45 seconds per set
    } else if (averageTimePerSet <= 60) {
      return { bonusXP: 20, timeCategory: 'Fast' }; // 45-60 seconds per set
    } else if (averageTimePerSet <= 90) {
      return { bonusXP: 10, timeCategory: 'Good' }; // 60-90 seconds per set
    } else {
      return { bonusXP: 0, timeCategory: 'Take Your Time' }; // Over 90 seconds per set
    }
  }, []);

  // Helper function to check if a translation word is matched
  const isTranslationMatched = useCallback((translationIndex: number) => {
    return matchedPairs?.some(englishIndex => {
      const englishWord = englishWords[englishIndex];
      const correctTranslation = currentWordPairs.find(pair => pair.english === englishWord)?.translation;
      return correctTranslation === translationWords[translationIndex];
    }) ?? false;
  }, [matchedPairs, englishWords, translationWords, currentWordPairs]);

  // Helper function to format time display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);


  const handleWordPress = useCallback((index: number, column: 'english' | 'translation') => {
    console.log('calculated')
    if (!lessonId) return;

    // If the timer is paused, resume it when user clicks any word
    if (isPaused) {
      resumeSetTimer(lessonId);
    }

    // If the word is already matched, do nothing (including animations)
    if ((matchedPairs?.includes(index) && column === 'english') ||
      (column === 'translation' && isTranslationMatched(index))) {
      return;
    }

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
    const correctTranslation = currentWordPairs.find(pair => pair.english === englishWord)?.translation;

    if (translationWord === correctTranslation) {
      // Correct match
      HapticSuccess?.();
      correctSound?.replayAsync()

      setMatchedPairs(lessonId, [...(matchedPairs ?? []), englishIndex]);
      setScore(lessonId, score + 10);

      // Check if all pairs are matched
      if ((matchedPairs?.length ?? 0) + 1 === currentWordPairs.length && !lessonCompleted) {
        // Stop the timer for this set
        stopSetTimer(lessonId);

        const finalScore = score + 10; // Calculate final score before calling completeLesson
        // Pass the score for the current set and the current set's index
        console.log('Before completeLesson - Current Set Score:', finalScore, 'Set Index:', currentSetIndex);
        completeLesson(lessonId, finalScore, currentSetIndex);
        if (isReplayingForErrors) {
          setIsReplayingForErrors(lessonId, false);
        }
        setCurrentSetCompleted(lessonId, true); // Mark lesson as completed after dialog is shown
        // Fetch the updated lesson state to display accumulated XP
        const updatedLessonState = useLessonStore.getState().dailyPlan?.lessons.find(l => l.id === lessonId);
        console.log('After completeLesson - Accumulated Lesson XP:', updatedLessonState?.xpReward);
        const updatedWPLesson = useLessonStore.getState().dailyPlan?.lessons.find(l => l.id === lessonId);
        const accumulatedLessonXP = updatedWPLesson?.xpReward || 0;
        const plannedTotalSets = updatedWPLesson?.totalSets ?? (currentLesson?.totalSets ?? 10);
        const allSetsAttempted = (updatedWPLesson?.completedSets || 0) >= plannedTotalSets;

        // Get the current set completion time
        const currentSetTime = setTimers[currentSetIndex] || currentSetElapsedTime;
        const totalTime = totalSessionTime + currentSetElapsedTime;

        let alertTitle = "Set Complete!";
        let alertMessage = `You scored ${finalScore} for this set in ${formatTime(currentSetTime)}.`;
        const alertButtons = [];

        if (allSetsAttempted) {
          // Calculate time bonus based on total session time (including error correction time)
          const timeBonus = calculateTimeBonusXP(totalTime, plannedTotalSets);

          // Apply/update time bonus (this handles recalculation automatically)
          addTimeBonusXP(lessonId, timeBonus.bonusXP);

          // Get updated lesson state after bonus application
          // Force a fresh state read to ensure we get the updated values
          const updatedState = useLessonStore.getState();
          const lessonAfterBonus = updatedState.dailyPlan?.lessons.find(l => l.id === lessonId);
          const finalLessonXP = lessonAfterBonus?.xpReward || accumulatedLessonXP;

          alertTitle = "All Sets Mastered!";
          // Calculate baseXP correctly: finalLessonXP already includes the updated scores
          // and any accumulated time bonus. We need to show the actual base scores.
          const currentStoredBonus = lessonAfterBonus?.currentTimeBonusXP || 0;
          const baseXP = finalLessonXP - currentStoredBonus;

          // Show the actual stored bonus (what's currently applied to the lesson)
          // This prevents showing the bonus as being "added again" during replays
          const actualAppliedBonus = currentStoredBonus;

          alertMessage = `You've completed all sets! Your base XP for this lesson is ${baseXP}.\n⏱️ Total time: ${formatTime(totalTime)}\n🏆 Speed bonus: +${actualAppliedBonus} XP (${timeBonus.timeCategory})\n✨ Final XP: ${finalLessonXP}`;
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
              alertMessage += `\n\n📍 Set ${parseInt(setIdx) + 1} (${errors.length} error${errors.length > 1 ? 's' : ''}):`;;
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
          alertMessage += ` Your current total XP for this lesson is ${accumulatedLessonXP}.\n⏱️ Current session time: ${formatTime(totalTime)}`;
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
            text: "➡️ Next Set",
            onPress: () => {
              setCurrentSetIndex?.(lessonId, currentSetIndex + 1);
              if (isGoingBack) setIsGoingBack(lessonId, false);
              // initializeGame will be called by useEffect
            }
          });
        }
        if (!allSetsAttempted || (allSetsAttempted && !errorDetails?.totalErrors)) {
          // Check for errors in the current set specifically
          const currentSetErrors = errorDetails?.incorrectMatches.filter(error =>
            error.setIndex === currentSetIndex
          ) || [];
          const hasCurrentSetErrors = currentSetErrors.length > 0;

          // Enhanced button text for "Play This Set Again"
          const replayButtonText = hasCurrentSetErrors ? "🔄 Replay Set (Fix Errors)" : "🔄 Play This Set Again";
          alertButtons.push({
            text: replayButtonText,
            onPress: () => {
              if (hasCurrentSetErrors) {
                setIsReplayingForErrors(lessonId, true); // Mark as replaying for error fixing
                if (isGoingBack) setIsGoingBack(lessonId, false);
                clearCurrentSetErrors(lessonId, currentSetIndex); // Clear errors for this set
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
                setCurrentSetCompleted(lessonId, false); // Reset lesson completed state when fixing a specific set
                setIsReplayingForErrors(lessonId, true); // Reset replay state when navigating to fix a specific set
                if (isGoingBack) setIsGoingBack(lessonId, false);
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
              // Close current modal first, then show the reset confirmation modal
              hideModal();
              setTimeout(() => {
                showModal({
                  title: "Start From Scratch?",
                  message: "This will reset ALL progress for this lesson. Your global XP and streak will be adjusted accordingly. Are you sure?",
                  buttons: [
                    {
                      text: "Cancel and Go to the lessons page",
                      style: "cancel" as const,
                      onPress: () => {
                        clearCurrentSetErrors(lessonId, currentSetIndex);
                        setIsGoingBack(lessonId, true);
                        hideModal();
                        setTimeout(() => {
                          router.replace("/(tabs)");
                        }, 100);
                      }
                    },
                    {
                      text: "Reset Lesson",
                      style: "destructive" as const,
                      onPress: () => {
                        hideModal();
                        setTimeout(() => {
                          resetWordPairsLesson(lessonId);
                        }, 100);
                      }
                    }
                  ]
                });
              }, 150); // Small delay to ensure first modal is fully closed
            }
          });
        }

        // Only show "Go Back" with save progress modal if there are still errors or not all sets completed
        if (!allSetsAttempted) {
          alertButtons.push({
            text: "🏠 Go Back",
            onPress: () => {
              // Close current modal first, then show the save progress modal
              hideModal();
              setTimeout(() => {
                const saveProgressButtons = [];
                saveProgressButtons.push({
                  text: "Next Set",
                  style: "cancel" as const,
                  onPress: () => {
                    hideModal();
                    setTimeout(() => {
                      if (isGoingBack) setIsGoingBack(lessonId, false);
                      setCurrentSetIndex?.(lessonId, currentSetIndex + 1);
                    }, 100);
                  }
                });
                saveProgressButtons.push({
                  text: "Go Back",
                  onPress: () => {
                    hideModal();
                    setTimeout(() => {
                      clearCurrentSetErrors(lessonId, currentSetIndex);
                      setIsGoingBack(lessonId, true);
                      router.replace("/(tabs)");
                    }, 100);
                  }
                });

                showModal({
                  title: "Save Progress?",
                  message: "Your overall lesson progress is automatically saved, along with the current score for this set! 💾\n\nBy the way, you will have to play it again in order to move on, make sure you read carefully the words, otherwise you could score lower\n\nGo back to main menu?",
                  buttons: saveProgressButtons
                });
              }, 150); // Small delay to ensure first modal is fully closed
            }
          });
        } else {
          // All sets completed - show simple go back option without additional modal
          alertButtons.push({
            text: "🏠 Return to Lessons",
            onPress: () => {
              hideModal();
              setTimeout(() => {
                clearCurrentSetErrors(lessonId, currentSetIndex);
                setIsGoingBack(lessonId, true);
                router.replace("/(tabs)");
              }, 100);
            }
          });
        }
        showModal({
          title: alertTitle,
          message: alertMessage,
          buttons: alertButtons
        });
        winningSound?.replayAsync();
      }
    } else {
      // Incorrect match
      HapticError?.();
      incorrectSound?.replayAsync()

      // Track detailed error information
      addErrorDetail(lessonId, englishWord, translationWord, currentSetIndex);

      setIncorrectPair(lessonId, {
        english: column === 'english' ? index : selectedPair.index,
        translation: column === 'translation' ? index : selectedPair.index
      });
      setScore(lessonId, score - 10);
      setTimeout(() => setIncorrectPair(lessonId, null), 500); // Clear after 1 second
    }

    // Reset selection
    setSelectedPair(lessonId, null);
  }, [
    lessonId,
    isPaused,
    resumeSetTimer,
    englishScaleValues,
    translationScaleValues,
    matchedPairs,
    isTranslationMatched,
    selectedPair,
    setSelectedPair,
    setIncorrectPair,
    englishWords,
    translationWords,
    currentWordPairs,
    HapticSuccess,
    correctSound,
    setMatchedPairs,
    score,
    setScore,
    lessonCompleted,
    stopSetTimer,
    completeLesson,
    isReplayingForErrors,
    setIsReplayingForErrors,
    setCurrentSetCompleted,
    currentSetIndex,
    setTimers,
    currentSetElapsedTime,
    totalSessionTime,
    formatTime,
    calculateTimeBonusXP,
    addTimeBonusXP,
    errorDetails,
    setCurrentSetIndex,
    isGoingBack,
    setIsGoingBack,
    initializeGame,
    addErrorDetail,
    clearCurrentSetErrors,
    hideModal,
    showModal,
    router,
    resetWordPairsLesson,
    winningSound,
    HapticError,
    incorrectSound
  ]);

  // Memoize theme-based styles for performance
  const themeStyles = useMemo(() => ({
    wordCell: {
      backgroundColor: theme.colors.surfaceVariant,
      shadowColor: theme.colors.shadow,
    },
    selectedCell: {
      backgroundColor: theme.colors.primary + '20', // Adding transparency
      borderColor: theme.colors.primary,
    },
    matchedCell: {
      backgroundColor: theme.colors.success + '20', // Using primary for success state
      borderColor: theme.colors.success,
    },
    incorrectCell: {
      backgroundColor: theme.colors.error + '20',
      borderColor: theme.colors.error,
    },
    wordText: {
      color: theme.colors.onSurface,
    },
    selectedText: {
      color: theme.colors.primary,
      fontWeight: '700' as const,
    },
    matchedText: {
      color: theme.colors.success, // Using primary for success state
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
      color: theme.colors.onPrimary,
    }
  }), [theme.colors]);

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
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <OnboardingTitle>Match the Pairs</OnboardingTitle>
          <OnboardingSubtitle>Tap the matching word pairs</OnboardingSubtitle>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreWithIcon}>
              <MaterialCommunityIcons
                name="trophy"
                size={30}
                color={theme.colors.warning}
                style={styles.scoreIcon}
              />
              <RNPText variant="titleLarge" style={styles.scoreText}>{score}</RNPText>
            </View>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => {
                if (!lessonId) return;
                if (isPaused) {
                  resumeSetTimer(lessonId);
                } else {
                  // Check if user has reached pause limit
                  if (pauseCount >= 2) {
                    showModal({
                      title: "Pause Limit Reached",
                      message: "You've already used your 2 pause attempts for this set! ⏸️\n\nTo prevent abuse and maintain fair gameplay, you can only pause twice per set.\n\nKeep playing to complete this set!",
                      buttons: [
                        {
                          text: "Got it!",
                          onPress: () => {
                            hideModal();
                          }
                        }
                      ]
                    });
                  } else {
                    pauseSetTimer(lessonId);
                  }
                }
              }}
              disabled={!currentSetStartTime}
            >
              <RNPText variant="titleLarge" style={styles.pauseButtonText}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </RNPText>
            </TouchableOpacity>
            <View style={styles.timerWithIcon}>
              <MaterialCommunityIcons
                name={isPaused ? "pause-circle" : "timer-sand"}
                size={30}
                color={isPaused ? theme.colors.error : theme.colors.primary}
                style={styles.timerIcon}
              />
              <RNPText variant="titleMedium" style={[styles.timerText, ...(isPaused ? [styles.pausedTimerText] : [])]}>
                {isPaused ? '' : formatTime(currentSetElapsedTime)}
              </RNPText>
            </View>
          </View>
        </View>
        <ProgressStepper
          totalSteps={totalSets}
          currentStep={currentSetIndex}
          completedSteps={completedSteps!}
          stepsWithErrors={stepsWithErrors}
          size="medium"
          isReplaying={isReplayingForErrors}
          isGoingBack={isGoingBack}
        />

        <View style={styles.gameContainer}>
          <View style={styles.column}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {englishWords.map((word, index) => (
                <AnimatedTouchable
                  key={`english-${index}`}
                  style={[getWordCellStyle(index, 'english'), getEnglishAnimatedStyle(index)]}
                  onPress={() => handleWordPress(index, 'english')}
                  disabled={isMatched(index)}
                >
                  <RNPText style={getWordTextStyle(index, 'english')}>{word}</RNPText>
                </AnimatedTouchable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.column}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {translationWords.map((word, index) => (
                <AnimatedTouchable
                  key={`translation-${index}`}
                  style={[getWordCellStyle(index, 'translation'), getTranslationAnimatedStyle(index)]}
                  onPress={() => handleWordPress(index, 'translation')}
                  disabled={isTranslationMatched(index)}
                >
                  <RNPText style={getWordTextStyle(index, 'translation')}>{word}</RNPText>
                </AnimatedTouchable>
              ))}
            </ScrollView>
          </View>
        </View>
        <NextButton
          onPress={() => {
            showModal({
              title: "Reset Game?",
              message: "Are you sure you want to reset the entire word pairs game? 🔄\n\nThis will:\n• Reset all your progress in this lesson\n• Clear your current score\n• Start from the beginning\n\nThis action cannot be undone!",
              buttons: [
                {
                  text: "Cancel",
                  style: "cancel" as const,
                  onPress: () => {
                    hideModal();
                  }
                },
                {
                  text: "Reset Game",
                  onPress: () => {
                    hideModal();
                    setTimeout(() => {
                      resetWordPairsLesson(lessonId!);
                      // Force re-initialization even if currentSetIndex was already 0
                      initializeGame();
                    }, 100);
                  }
                }
              ]
            });
          }}
        >
          <RNPText style={[styles.resetButtonText, themeStyles.resetButtonText]}>Reset Game</RNPText>
        </NextButton>
      </SafeAreaView>
      <PortalModal
        visible={modalVisible}
        content={modalContent}
        onClose={hideModal}
        id={modalId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  scoreWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIcon: {
    marginRight: 6,
  },
  scoreText: {
    fontWeight: 'bold',
  },
  timerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    marginRight: 4,
  },
  timerText: {
    fontWeight: 'bold',
    color: '#666',
  },
  pauseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pausedTimerText: {
    color: '#FF6B35',
    fontWeight: 'bold',
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