import { PortalModal } from '@/components/ui/portal';
import { useAppTheme } from '@/components/ui/theme';
import { VOCABULARY_WORD_SETS } from '@/lib/constants/constants';
import { useAudio } from '@/lib/hooks/use-audio';
import { useHaptic } from '@/lib/hooks/use-haptic';
import { useRecording } from '@/lib/hooks/use-recording';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import { usePortalModalStore } from '@/lib/store/portal-modal-store';

import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, IconButton, ProgressBar, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VocabularyScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: LessonType }>();
  const theme = useAppTheme();
  const { playCorrect, playIncorrect, playWin, playWordAudio } = useAudio();
  const {
    getVocabularyState,
    getLesson,
    setVocabularyWords,
    setCurrentWordIndex,
    incrementVocabularyAttempts,
    resetVocabularyAttempts,
    setVocabularyCompleted,
    addAIScore,
    updatePronunciationAccuracy,
    incrementWordsCompleted,
    initializeLessonSessionState,
    // Timer methods
    startWordTimer,
    stopWordTimer,
    updateCurrentWordElapsedTime,
    pauseWordTimer,
    resumeWordTimer,
    resetVocabularyTimers,
    resetVocabularyLesson,
    calculateWordXP,
    addVocabularyWordXP,
    updateVocabularyWordXP,
    resumeWordTimerFromElapsed,
    // Incomplete words methods
    addIncompleteWord,
    addSkippedWord,
    retryIncompleteWord,
    removeIncompleteWord,
    completeLesson
  } = useLessonStore();

  const { visible: modalVisible, content: modalContent, modalId, showModal, hideModal } = usePortalModalStore();
  const vocabularyState = getVocabularyState(lessonId!);
  const hapticSuccess = useHaptic('success');
  const hapticError = useHaptic('error');
  const hapticMedium = useHaptic('medium');
  const {
    recordingUri,
    isProcessing,
    isRecording,
    recordingDuration,
    setIsProcessing,
    setRecordingUri,
    startRecording: originalStartRecording,
    stopRecording,
    cleanup,
  } = useRecording();

  // Enhanced startRecording that handles timer state
  const startRecording = useCallback(() => {
    // Resume timer when recording starts, regardless of paused state
    if (vocabularyState?.isPaused) {
      // If paused, resume the timer
      resumeWordTimer(lessonId!);
    } else if (!vocabularyState?.currentWordStartTime) {
      // If timer was stopped, resume from elapsed time
      resumeWordTimerFromElapsed(lessonId!);
    }

    originalStartRecording();
  }, [originalStartRecording, lessonId, vocabularyState?.currentWordStartTime, vocabularyState?.isPaused, resumeWordTimer, resumeWordTimerFromElapsed]);

  const [error, setError] = useState<string | null>(null);
  const retryXpDeltaRef = useRef<number>(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  // Initialize lesson only once on mount
  useEffect(() => {
    initializeLesson();
  }, [lessonId]); // Only depend on lessonId to reinitialize when lesson changes

  // Update word timer periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (vocabularyState && !vocabularyState.lessonCompleted) {
        // Update current word elapsed time if timer is running
        if (vocabularyState.currentWordStartTime && !vocabularyState.isPaused) {
          updateCurrentWordElapsedTime(lessonId!);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [vocabularyState?.lessonCompleted, vocabularyState?.currentWordStartTime, vocabularyState?.isPaused, lessonId, updateCurrentWordElapsedTime]);

  // Cleanup recording on unmount only
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []); // No dependencies - only cleanup on unmount

  const initializeLesson = () => {
    initializeLessonSessionState(lessonId!, 'vocabulary');
    // Start with consonants_th set for demo
    const words = VOCABULARY_WORD_SETS.consonants_th;
    setVocabularyWords(lessonId!, words);
    
    // Reset retry XP delta for new lesson
    retryXpDeltaRef.current = 0;

    // Start timer for the first word
    setTimeout(() => {
      startWordTimer(lessonId!);
    }, 200);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  // Memoized calculations for performance
  const currentWord = useMemo(() => {
    if (!vocabularyState?.words || vocabularyState.words.length === 0) {
      return null;
    }
    
    const currentIndex = vocabularyState?.currentWordIndex ?? 0;
    if (currentIndex >= vocabularyState.words.length) {
      return null;
    }
    const word = vocabularyState.words[currentIndex];
    return word;
  }, [vocabularyState?.words, vocabularyState?.currentWordIndex]);

  const progress = useMemo(() =>
    vocabularyState?.words ? ((vocabularyState?.currentWordIndex ?? 0) + 1) / vocabularyState.words.length : 0,
    [vocabularyState?.words, vocabularyState?.currentWordIndex]
  );

  // Memoized handlers for performance
  const handleNextWord = useCallback(() => {
    if (!vocabularyState?.words) return;

    // Stop current word timer before moving to next word
    if (vocabularyState.currentWordStartTime) {
      stopWordTimer(lessonId!);
    }

    // If we're retrying a word, return to completion screen instead of continuing
    if (vocabularyState.isRetryingWord) {
      setVocabularyCompleted(lessonId!, true);
      // Pass the accumulated XP delta from retried words
      completeLesson(lessonId!, retryXpDeltaRef.current);
      retryXpDeltaRef.current = 0; // Reset for next session
      playWin();
      hapticSuccess?.();
      return;
    }

    const nextIndex = (vocabularyState.currentWordIndex ?? 0) + 1;
    if (nextIndex < vocabularyState.words.length) {
      setCurrentWordIndex(lessonId!, nextIndex);
      setRecordingUri(null);

      // Start timer for the new word
      setTimeout(() => {
        startWordTimer(lessonId!);
      }, 300); // Small delay to ensure state is updated

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setVocabularyCompleted(lessonId!, true);
      // Also call the global completeLesson function to update lesson status
      completeLesson(lessonId!, 0);
      playWin();
      hapticSuccess?.();
    }
  }, [vocabularyState?.words, vocabularyState?.currentWordIndex, vocabularyState?.currentWordStartTime, vocabularyState?.isRetryingWord, lessonId, setCurrentWordIndex, setRecordingUri, stopWordTimer, startWordTimer, fadeAnim, setVocabularyCompleted, completeLesson, playWin, hapticSuccess]);


  const submitRecording = useCallback(async () => {
    if (!recordingUri || !currentWord) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: recordingUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('target_word', currentWord.word);

      const response = await fetch('http://192.168.1.100:8000/api/pronunciation/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const score = Math.round(result.overall_score * 100);
      addAIScore(lessonId!, score);
      updatePronunciationAccuracy(lessonId!);
      incrementVocabularyAttempts(lessonId!);

      if (score >= 70) {
        incrementWordsCompleted(lessonId!);
        playCorrect();
        hapticSuccess?.();
      } else {
        playIncorrect();
        hapticError?.();
      }

    } catch (error) {
      console.error('Error submitting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to analyze pronunciation: ${errorMessage}`);
      Alert.alert('Error', 'Failed to analyze pronunciation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [recordingUri, currentWord, setIsProcessing, lessonId, addAIScore, updatePronunciationAccuracy, incrementVocabularyAttempts, incrementWordsCompleted, playCorrect, playIncorrect, hapticSuccess, hapticError]);

  // Helper function to calculate partial XP for failed final attempts
  const calculatePartialXP = useCallback(() => {
    const currentWordIndex = vocabularyState?.currentWordIndex ?? 0;
    const bestAttemptScore = vocabularyState?.aiScores && vocabularyState.aiScores.length > 0
      ? Math.max(...vocabularyState.aiScores.slice(-3)) // Best of last 3 attempts
      : 50; // Fallback if no scores available
    return Math.floor(calculateWordXP(lessonId!, currentWordIndex, bestAttemptScore, 3, currentWord?.difficulty) * 0.15); // 15% of best attempt XP
  }, [vocabularyState?.currentWordIndex, vocabularyState?.aiScores, lessonId, currentWord?.difficulty, calculateWordXP]);

  const simulateAIFeedback = async (uri: string) => {
    setIsProcessing(true);

    // Pause the current word timer immediately when user clicks "Get Feedback"
    if (vocabularyState?.currentWordStartTime) {
      pauseWordTimer(lessonId!);
    }

    // Get current attempts (don't increment yet - only increment after failure)
    const currentAttempts = vocabularyState?.attempts ?? 0;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random but realistic feedback
    const accuracy = Math.random() * 40 + 60; // 60-100% accuracy

    if (currentWord) {
      addAIScore(lessonId!, accuracy);

      let isCorrect = accuracy >= 70;

      if (isCorrect) {
        updatePronunciationAccuracy(lessonId!);

        // Calculate and award XP for this word with attempt and difficulty bonuses
        const currentWordIndex = vocabularyState?.currentWordIndex ?? 0;
        const wordDifficulty = currentWord.difficulty;
        const wordXP = calculateWordXP(lessonId!, currentWordIndex, accuracy, currentAttempts + 1, wordDifficulty);
        
        // If this is a retry, update the existing XP instead of adding new XP
        if (vocabularyState?.isRetryingWord) {
          updateVocabularyWordXP(lessonId!, currentWordIndex, wordXP);
          const xpDelta = wordXP;
          
          // Store the XP delta for when the lesson completes
        if (xpDelta > 0) {
          // We'll use this delta when calling completeLesson
          retryXpDeltaRef.current = (retryXpDeltaRef.current || 0) + xpDelta;
        }
          
          removeIncompleteWord(lessonId!, currentWordIndex);
        } else {
          addVocabularyWordXP(lessonId!, wordXP);
        }

        // Enhanced feedback messages for correct pronunciation
        const excellentMessages = [
          `Excellent! Perfect "${currentWord.targetSound}" sound! 🎉`,
          `Outstanding pronunciation! You nailed it! ⭐`,
          `Brilliant! That was spot-on! 🌟`,
          `Perfect! Your pronunciation is improving! 🚀`
        ];

        const goodMessages = [
          `Great job! Nice "${currentWord.targetSound}" sound! 👏`,
          `Well done! Keep up the good work! 💪`,
          `Good pronunciation! You're getting better! 📈`,
          `Nice work! That sounded great! 🎵`
        ];

        const messages = accuracy >= 90 ? excellentMessages : goodMessages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Enhanced feedback showing XP breakdown
        const attemptText = currentAttempts === 0 ? 'Perfect!' : currentAttempts === 1 ? '2nd try' : '3rd try';
        const difficultyBonus = currentWord.difficulty === 'hard' ? ' +Difficulty Bonus!' : currentWord.difficulty === 'easy' ? ' (Easy word)' : '';
        const feedbackMessage = `${randomMessage}\n\nAccuracy: ${Math.round(accuracy)}%\n${attemptText}${difficultyBonus}\n\n+${wordXP} XP earned! 🎉`;
        
        playCorrect();
        hapticSuccess?.();

        // Show success feedback in modal
        showModal({
          title: "Great Pronunciation! ✨",
          message: feedbackMessage,
          buttons: [
            {
              text: "Next Word",
              onPress: () => {
                hideModal();
                setTimeout(() => {
                  nextWord();
                }, 100);
              }
            }
          ]
        });
      } else {
        // Increment attempts only after a failed attempt
        incrementVocabularyAttempts(lessonId!);
        
        // Enhanced encouraging messages for incorrect attempts
        const encouragingMessages = [
          `Almost there! Focus on the "${currentWord.targetSound}" sound.`,
          `Good effort! Try emphasizing the "${currentWord.targetSound}" more.`,
          `You're close! Listen carefully to the "${currentWord.targetSound}" sound.`,
          `Keep trying! Pay attention to how "${currentWord.targetSound}" is pronounced.`
        ];

        let enhancedFeedback = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        const attemptsLeft = 3 - (currentAttempts + 1);
        const isLastAttempt = (currentAttempts + 1) >= 3;
        
        // Calculate partial XP once for reuse in both feedback and button handler
        const partialXP = isLastAttempt ? calculatePartialXP() : 0;
        
        if (isLastAttempt) {
          enhancedFeedback = `Don't worry! This word will appear in the final screen for more practice. You earned ${partialXP} XP for your effort! 💪\n\nAccuracy: ${Math.round(accuracy)}%`;
        } else if (attemptsLeft === 1) {
          enhancedFeedback += "\n\n🎯 Last chance - you can do this!";
        } else if (attemptsLeft > 1) {
          enhancedFeedback += `\n\n💪 ${attemptsLeft} attempts remaining!`;
        }

        if (!isLastAttempt) {
          enhancedFeedback += `\n\nAccuracy: ${Math.round(accuracy)}%`;
        }
        
        playIncorrect();
        hapticError?.();
        
        // Show encouraging feedback in modal
        showModal({
          title: isLastAttempt ? "Attempts Completed" : "Keep Trying! 💪",
          message: enhancedFeedback,
          buttons: [
            {
              text: isLastAttempt ? "Next Word" : "Try Again",
              onPress: () => {
                hideModal();
                if (isLastAttempt) {
                  // Award minimal XP for effort and add to incomplete words
                  // Reuse the partialXP calculated above to avoid double calculation
                  addVocabularyWordXP(lessonId!, partialXP);
                  addIncompleteWord(lessonId!, vocabularyState?.currentWordIndex ?? 0);
                  // Move to next word after final failed attempt
                  setTimeout(() => {
                    nextWord();
                  }, 100);
                } else {
                  // Clear recording to allow new attempt
                  setRecordingUri(null);
                }
              }
            }
          ]
        });
      }
    }

    setIsProcessing(false);
  };

  const nextWord = useCallback(() => {
    incrementWordsCompleted(lessonId!);
    // Reset attempts for the current word before moving to next
    resetVocabularyAttempts(lessonId!);
    handleNextWord();

    // Update progress
    const nextIndex = (vocabularyState?.currentWordIndex ?? 0) + 1;
    const progress = nextIndex / (vocabularyState?.words?.length || 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [incrementWordsCompleted, resetVocabularyAttempts, lessonId, handleNextWord, vocabularyState?.currentWordIndex, vocabularyState?.words?.length, progressAnim]);

  const skipWord = useCallback(() => {
    // Add the current word to both incomplete and skipped words so user can retry it later
    if (vocabularyState?.currentWordIndex !== undefined) {
      addIncompleteWord(lessonId!, vocabularyState.currentWordIndex);
      addSkippedWord(lessonId!, vocabularyState.currentWordIndex);
      
      // Award minimal XP for skipped words to maintain XP tracking consistency
      const minimalXP = calculateWordXP(lessonId!, vocabularyState.currentWordIndex, 0, 1, currentWord?.difficulty); // 0 score for skipped word
      addVocabularyWordXP(lessonId!, minimalXP);
    }
    handleNextWord();
  }, [handleNextWord, addIncompleteWord, addSkippedWord, lessonId, vocabularyState?.currentWordIndex, calculateWordXP, currentWord?.difficulty, addVocabularyWordXP]);

  const handleRestartLesson = useCallback(() => {
    // Store the timer state before pausing
    const wasTimerRunning = vocabularyState?.currentWordStartTime && !vocabularyState?.isPaused;

    // Pause the timer when modal opens
    if (wasTimerRunning) {
      pauseWordTimer(lessonId!);
    }

    showModal({
      title: "Restart Vocabulary Lesson?",
      message: "This will reset ALL progress for this lesson. Your global XP and streak will be adjusted accordingly. Are you sure?",
      buttons: [
        {
          text: "Cancel",
          style: "cancel" as const,
          onPress: () => {
            hideModal();
            // Resume the timer if it was running before the modal
            if (wasTimerRunning) {
              resumeWordTimer(lessonId!);
            }
          }
        },
        {
          text: "Restart Lesson",
          style: "destructive" as const,
          onPress: () => {
            hideModal();
            setTimeout(() => {
              // Clear recording state before resetting lesson
              setRecordingUri(null);
              cleanup();
              resetVocabularyLesson(lessonId!);
              // Reinitialize the lesson after reset
              setTimeout(() => {
                initializeLesson();
              }, 100);
            }, 100);
          }
        }
      ]
    });
  }, [showModal, hideModal, resetVocabularyLesson, lessonId, initializeLesson, vocabularyState?.currentWordStartTime, vocabularyState?.isPaused, pauseWordTimer, resumeWordTimer]);

  const handleWordCardPress = useCallback(async () => {
    if (!currentWord?.word) {
      console.warn('No word available for pronunciation');
      return;
    }

    // Disable card interaction while recording
    if (isRecording) {
      return;
    }

    // If the game is paused, unpause it when user interacts with the card
    if (vocabularyState?.isPaused) {
      resumeWordTimer(lessonId!);
    }

    // Haptic feedback
    hapticMedium?.();

    // Visual feedback animation
    Animated.sequence([
      Animated.timing(cardScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Play word audio using expo-speech
    try {
      console.log('Word card pressed, playing pronunciation for:', currentWord.word);
      playWordAudio(currentWord.word);
    } catch (error) {
      console.error('Failed to play word audio:', error);
    }
  }, [currentWord, cardScaleAnim, playWordAudio, vocabularyState?.isPaused, resumeWordTimer, lessonId, isRecording, hapticMedium]);

  // Error boundary
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Something went wrong: {error}</Text>
        <Button
          mode="outlined"
          onPress={() => {
            setError(null);
            router.back();
          }}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (vocabularyState?.lessonCompleted) {
    const totalSessionMinutes = Math.floor((vocabularyState?.totalSessionTime ?? 0) / 60);
    const totalSessionSeconds = (vocabularyState?.totalSessionTime ?? 0) % 60;
    const lesson = getLesson(lessonId!);
    const totalXP = lesson?.xpReward ?? 0;
    const averageWordAccurancy = Math.round(vocabularyState?.pronunciationAccuracy ?? 0);
    const incompleteWords = vocabularyState?.incompleteWords ?? [];

    const handleRetryWord = (wordIndex: number) => {
      // Clear recording state before retrying
      setRecordingUri(null);
      cleanup();
      
      retryIncompleteWord(lessonId!, wordIndex);
      // Start timer for the retried word
      setTimeout(() => {
        startWordTimer(lessonId!);
      }, 200);
    };

    return (
      <>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Animated.View style={[styles.completionContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={[styles.completionTitle, { color: theme.colors.primary }]}>🎉 Lesson Complete!</Text>

            <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Text style={[styles.completionScore, { color: theme.colors.onBackground }]}>
                Final Score: {totalXP} XP
              </Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
                Words Completed: {vocabularyState?.wordsCompleted ?? 0}
              </Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
                Average Accuracy: {averageWordAccurancy}%
              </Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
                Estimated Total Time: {totalSessionMinutes}:{totalSessionSeconds.toString().padStart(2, '0')}
              </Text>
            </Surface>

            {incompleteWords.length > 0 && (
              <Surface style={[styles.incompleteWordsCard, { backgroundColor: theme.colors.errorContainer }]} elevation={2}>
                <Text style={[styles.incompleteWordsTitle, { color: theme.colors.onErrorContainer }]}>
                  💪 Words to Retry ({incompleteWords.length})
                </Text>
                <Text style={[styles.incompleteWordsSubtitle, { color: theme.colors.onErrorContainer }]}>
                  Give these words another chance!
                </Text>
                {incompleteWords.map((wordIndex) => {
                  const word = vocabularyState?.words?.[wordIndex];
                  if (!word) return null;
                  return (
                    <View key={wordIndex} style={styles.incompleteWordItem}>
                      <View style={styles.incompleteWordInfo}>
                        <Text style={[styles.incompleteWordText, { color: theme.colors.onErrorContainer }]}>
                          {word.word}
                        </Text>
                        <Text style={[styles.incompleteWordPhonetic, { color: theme.colors.onErrorContainer }]}>
                          {word.phonetic}
                        </Text>
                      </View>
                      <Button
                        mode="contained"
                        onPress={() => handleRetryWord(wordIndex)}
                        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                        labelStyle={{ color: theme.colors.onPrimary }}
                        compact
                      >
                        Retry
                      </Button>
                    </View>
                  );
                })}
              </Surface>
            )}

            <Button
              mode="contained"
              onPress={() => router.back()}
              style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: theme.colors.onPrimary }}
              accessibilityLabel="Return to lessons"
              accessibilityHint="Tap to go back to the lesson selection screen"
            >
              Back to Lessons
            </Button>
            {/* Restart Button */}
            <View style={styles.restartContainer}>
              <Button
                mode="contained"
                onPress={handleRestartLesson}
                style={styles.restartButton}
                disabled={isProcessing || isRecording}
                accessibilityLabel="Restart lesson"
                accessibilityHint="Tap to restart the entire vocabulary lesson from the beginning"
                icon="restart"
              >
                🔄 Restart Lesson
              </Button>
            </View>
          </Animated.View>
        </View>
        <PortalModal
          visible={modalVisible}
          content={modalContent}
          onClose={hideModal}
          id={modalId}
        />
      </>
    );
  }

  if (!currentWord) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading...</Text>
        <ProgressBar indeterminate style={styles.loadingProgress} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {(vocabularyState?.currentWordIndex ?? 0) + 1} of {vocabularyState?.words?.length || 0}
            </Text>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Text style={[styles.timerLabel, { color: theme.colors.onSurfaceVariant }]}>
              Word Time:
            </Text>
            <Text style={[styles.timerText, { color: theme.colors.primary }]}>
              {vocabularyState?.currentWordElapsedTime ?
                `${Math.floor(vocabularyState.currentWordElapsedTime / 60)}:${(vocabularyState.currentWordElapsedTime % 60).toString().padStart(2, '0')}`
                : '0:00'
              }
            </Text>
            {vocabularyState?.isPaused && (
              <Text style={[styles.pausedText, { color: theme.colors.error }]}>
                PAUSED
              </Text>
            )}
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Attempt Counter */}
          <View style={styles.attemptCounter}>
            <Text style={[styles.attemptText, { color: theme.colors.onSurfaceVariant }]}>
              Attempt {Math.min((vocabularyState?.attempts ?? 0) + 1, vocabularyState?.maxAttempts ?? 3)} of {vocabularyState?.maxAttempts ?? 3}
            </Text>
            <View style={styles.attemptDots}>
              {Array.from({ length: vocabularyState?.maxAttempts ?? 3 }).map((_, index) => {
                const currentAttempt = (vocabularyState?.attempts ?? 0) + 1; // Add 1 to match the display
                const isActive = index < currentAttempt;
                const isMaxed = currentAttempt >= (vocabularyState?.maxAttempts ?? 3) && index === (vocabularyState?.maxAttempts ?? 3) - 1;

                return (
                  <View
                    key={index}
                    style={[
                      styles.attemptDot,
                      {
                        backgroundColor: isMaxed
                          ? theme.colors.error
                          : isActive
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        transform: [{ scale: isMaxed ? 1.2 : 1 }],
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleWordCardPress}
            activeOpacity={isRecording ? 1 : 0.8}
            disabled={isRecording}
            accessibilityLabel={`Tap to hear pronunciation of ${currentWord.word}`}
            accessibilityHint={isRecording ? "Card disabled while recording" : "Tap the word card to play the pronunciation audio"}
            accessibilityRole="button"
          >
            <Animated.View style={{ transform: [{ scale: cardScaleAnim }] }}>
              <Card style={[
                styles.wordCard,
                {
                  backgroundColor: theme.colors.surface,
                  opacity: isRecording ? 0.5 : 1
                }
              ]}>
                <View style={[
                  styles.wordCardContent,
                  isRecording && { opacity: 0.6 }
                ]}>
                  <View style={styles.wordHeader}>
                    <Text style={[styles.wordText, { color: theme.colors.onSurface }]}>
                      {currentWord.word}
                    </Text>
                    <Text style={[
                      styles.audioHint,
                      {
                        color: isRecording ? theme.colors.onSurfaceVariant : theme.colors.primary,
                        opacity: isRecording ? 0.5 : 1
                      }
                    ]}>
                      {isRecording ? '🚫 Recording...' : '🔊 Tap to hear'}
                    </Text>
                  </View>
                  <Text style={[styles.phoneticText, { color: theme.colors.primary }]}>
                    {currentWord.phonetic}
                  </Text>
                  <Text style={[styles.definitionText, { color: theme.colors.onSurface }]}>
                    {currentWord.definition}
                  </Text>
                  <Text style={[styles.exampleText, { color: theme.colors.onSurfaceVariant }]}>
                    "{currentWord.example}"
                  </Text>
                </View>
              </Card>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.targetSoundContainer}>
            <Text style={[styles.targetSoundLabel, { color: theme.colors.onSurfaceVariant }]}>
              Focus on this sound:
            </Text>
            <Text style={[styles.targetSoundText, {
              backgroundColor: theme.colors.primaryContainer,
              color: theme.colors.onPrimaryContainer,
            }]}>
              {currentWord.targetSound}
            </Text>
          </View>

          <View style={styles.recordingContainer}>
            <Surface
              style={[
                styles.recordButton,
                {
                  backgroundColor: isRecording
                    ? theme.colors.error
                    : theme.colors.primary
                }
              ]}
              elevation={4}
            >
              <IconButton
                icon={isRecording ? 'stop' : 'microphone'}
                size={32}
                iconColor={isRecording ? theme.colors.onError : theme.colors.onPrimary}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
                accessibilityHint={isRecording ? 'Tap to stop recording your pronunciation' : 'Tap to start recording your pronunciation'}
              />
            </Surface>

            {isRecording && (
              <Text style={[styles.recordingText, { color: theme.colors.error }]}>
                Recording... {recordingDuration}s
              </Text>
            )}

            {isProcessing && (
              <Text style={[styles.processingText, { color: theme.colors.onSurfaceVariant }]}>
                Analyzing pronunciation...
              </Text>
            )}
          </View>

          {/* Restart Button */}
          <View style={styles.restartContainer}>
            <Button
              mode="outlined"
              onPress={handleRestartLesson}
              style={styles.restartButton}
              disabled={isProcessing || isRecording}
              accessibilityLabel="Restart lesson"
              accessibilityHint="Tap to restart the entire vocabulary lesson from the beginning"
              icon="restart"
            >
              🔄 Restart Lesson
            </Button>
          </View>

          <View style={styles.actionsContainer}>
            {/* Hide skip button if user is retrying a previously skipped word */}
            {!(vocabularyState?.isRetryingWord && vocabularyState?.skippedWords?.includes(vocabularyState?.currentWordIndex ?? -1)) && (
              <Button
                mode="outlined"
                onPress={skipWord}
                style={styles.skipButton}
                disabled={isProcessing || isRecording}
                accessibilityLabel="Skip current word"
                accessibilityHint="Tap to skip this word and move to the next one"
              >
                Skip
              </Button>
            )}

            {/* Pause/Resume Button */}
            {vocabularyState?.currentWordStartTime && (
              <Button
                mode="outlined"
                onPress={() => {
                  if (vocabularyState.isPaused) {
                    resumeWordTimer(lessonId!);
                  } else {
                    // Check if user has reached pause limit
                    if ((vocabularyState.pauseCount ?? 0) >= 2) {
                      showModal({
                        title: "Pause Limit Reached",
                        message: "You've already used your 2 pause attempts for this word! ⏸️\n\nTo prevent abuse and maintain fair gameplay, you can only pause twice per word.\n\nKeep playing to complete this word!",
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
                      pauseWordTimer(lessonId!);
                    }
                  }
                }}
                style={styles.pauseButton}
                disabled={isProcessing || isRecording}
                accessibilityLabel={vocabularyState.isPaused ? 'Resume timer' : 'Pause timer'}
              >
                {vocabularyState.isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}

            {recordingUri && !isRecording && (
              <Button
                mode="contained"
                onPress={() => simulateAIFeedback(recordingUri)}
                style={styles.nextButton}
                disabled={isProcessing}
                accessibilityLabel={isProcessing ? 'Analyzing pronunciation' : 'Get feedback on pronunciation'}
                accessibilityHint="Tap to analyze your pronunciation recording"
              >
                Get Feedback
              </Button>
            )}
          </View>
        </Animated.View>
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
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingProgress: {
    width: '80%',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    marginTop: 10,
  },
  header: {
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  wordCard: {
    padding: 24,
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
  },
  wordCardContent: {
    alignItems: 'center',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 12,
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioHint: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  phoneticText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  definitionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  targetSoundContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  targetSoundLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  targetSoundText: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 8,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  processingText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  restartContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  restartButton: {
    width: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 8,
  },
  skipButton: {
    flex: 1,
  },
  pauseButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  completionScore: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  completionStats: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Timer styles
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  pausedText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  // Completion screen styles
  statsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  xpCard: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  xpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  xpTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  xpBreakdown: {
    fontSize: 14,
    marginBottom: 4,
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
  },
  // Attempt counter styles
  attemptCounter: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  attemptText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  attemptDots: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  attemptDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // Incomplete words styles
  incompleteWordsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  incompleteWordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  incompleteWordsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  incompleteWordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  incompleteWordInfo: {
    flex: 1,
  },
  incompleteWordText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  incompleteWordPhonetic: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  retryButton: {
    marginLeft: 12,
    minWidth: 80,
  },
});