import { PortalModal } from '@/components/ui/portal';
import { useAppTheme } from '@/components/ui/theme';
import { VOCABULARY_WORD_SETS } from '@/lib/constants/constants';
import { useAudio } from '@/lib/hooks/use-audio';
import { useRecording } from '@/lib/hooks/use-recording';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import { usePortalModalStore } from '@/lib/store/portal-modal-store';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, ProgressBar, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');



export default function VocabularyScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: LessonType }>();
  const theme = useAppTheme();
  const { playCorrect, playIncorrect, playWin } = useAudio();
  const {
    getVocabularyState,
    setVocabularyWords,
    setCurrentWordIndex,
    setVocabularyScore,
    incrementVocabularyAttempts,
    setVocabularyCompleted,
    addAIScore,
    setFeedback,
    setShowFeedback,
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
    addVocabularyTimeBonusXP,
    addWordXP
  } = useLessonStore();

  const { visible: modalVisible, content: modalContent, modalId, showModal, hideModal } = usePortalModalStore();
  const vocabularyState = getVocabularyState(lessonId!);
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

  // Enhanced startRecording that resets feedback state
  const startRecording = useCallback(() => {
    // Reset feedback state to allow new feedback after recording
    setShowFeedback(lessonId!, false);
    setFeedback(lessonId!, '');
    originalStartRecording();
  }, [originalStartRecording, setShowFeedback, setFeedback, lessonId]);

  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

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

  const initializeLesson = async () => {
    initializeLessonSessionState(lessonId!, 'vocabulary');
    // Start with consonants_th set for demo
    const words = VOCABULARY_WORD_SETS.consonants_th;
    setVocabularyWords(lessonId!, words);

    // Start timer for the first word
    setTimeout(() => {
      startWordTimer(lessonId!);
    }, 500);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const getCurrentWord = () => {
    if (!vocabularyState?.words || (vocabularyState?.currentWordIndex ?? 0) >= vocabularyState.words.length) {
      return null;
    }
    return vocabularyState.words[vocabularyState?.currentWordIndex ?? 0];
  };

  // Memoized calculations for performance
  const currentWord = useMemo(() => getCurrentWord(), [vocabularyState?.words, vocabularyState?.currentWordIndex]);

  const progress = useMemo(() =>
    vocabularyState?.words ? (vocabularyState?.currentWordIndex ?? 0) / vocabularyState.words.length : 0,
    [vocabularyState?.words, vocabularyState?.currentWordIndex]
  );

  const avgAccuracy = useMemo(() =>
    vocabularyState?.aiScores && vocabularyState.aiScores.length > 0
      ? vocabularyState.aiScores.reduce((sum, score) => sum + score, 0) / vocabularyState.aiScores.length
      : 0,
    [vocabularyState?.aiScores]
  );



  // Memoized handlers for performance
  const handleNextWord = useCallback(() => {
    if (!vocabularyState?.words) return;

    // Stop current word timer before moving to next word
    if (vocabularyState.currentWordStartTime) {
      stopWordTimer(lessonId!);
    }

    const nextIndex = (vocabularyState.currentWordIndex ?? 0) + 1;
    if (nextIndex < vocabularyState.words.length) {
      setCurrentWordIndex(lessonId!, nextIndex);
      setRecordingUri(null);
      setShowFeedback(lessonId!, false);

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
      completeLesson();
    }
  }, [vocabularyState?.words, vocabularyState?.currentWordIndex, vocabularyState?.currentWordStartTime, lessonId, setCurrentWordIndex, setRecordingUri, setShowFeedback, stopWordTimer, startWordTimer, fadeAnim]);

  const completeLessonCallback = useCallback(() => {
    setVocabularyCompleted(lessonId!, true);
    playWin();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [lessonId, setVocabularyCompleted, playWin]);

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

      const feedback = `Pronunciation Score: ${score}%\n\n${result.feedback || 'Good effort! Keep practicing.'}`;
      setFeedback(lessonId!, feedback);
      setShowFeedback(lessonId!, true);

      incrementVocabularyAttempts(lessonId!);

      if (score >= 70) {
        setVocabularyScore(lessonId!, (vocabularyState?.score ?? 0) + 10);
        incrementWordsCompleted(lessonId!);
        playCorrect();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        playIncorrect();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

    } catch (error) {
      console.error('Error submitting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to analyze pronunciation: ${errorMessage}`);
      Alert.alert('Error', 'Failed to analyze pronunciation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [recordingUri, currentWord, setIsProcessing, lessonId, addAIScore, updatePronunciationAccuracy, setFeedback, setShowFeedback, incrementVocabularyAttempts, vocabularyState?.score, setVocabularyScore, incrementWordsCompleted, playCorrect, playIncorrect]);

  const simulateAIFeedback = async (uri: string) => {
    setIsProcessing(true);

    // Stop the current word timer immediately when user clicks "Get Feedback"
    if (vocabularyState?.currentWordStartTime) {
      stopWordTimer(lessonId!);
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random but realistic feedback
    const accuracy = Math.random() * 40 + 60; // 60-100% accuracy
    const currentWord = getCurrentWord();

    if (currentWord) {
      addAIScore(lessonId!, accuracy);

      let feedbackText = '';
      let isCorrect = accuracy >= 75;

      if (accuracy >= 90) {
        feedbackText = 'Excellent pronunciation! 🎉';
      } else if (accuracy >= 80) {
        feedbackText = 'Great job! Keep practicing. 👍';
      } else if (accuracy >= 70) {
        feedbackText = 'Good effort! Focus on the target sound.';
      } else {
        feedbackText = 'Keep trying! Listen carefully and repeat.';
        isCorrect = false;
      }

      setFeedback(lessonId!, feedbackText);
      setShowFeedback(lessonId!, true);

      // Play audio feedback
      if (isCorrect) {
        playCorrect();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        playIncorrect();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      incrementVocabularyAttempts(lessonId!);

      if (isCorrect) {
        updatePronunciationAccuracy(lessonId!);

        // Calculate and award XP for this word
        const currentWordIndex = vocabularyState?.currentWordIndex ?? 0;
        const wordXP = calculateWordXP(lessonId!, currentWordIndex, accuracy);

        // Add to lesson XP reward
        addWordXP(lessonId!, wordXP);

        setTimeout(() => {
          nextWord();
        }, 2000);
      }
    }

    setIsProcessing(false);
  };

  const nextWord = useCallback(() => {
    incrementWordsCompleted(lessonId!);
    handleNextWord();

    // Update progress
    const nextIndex = (vocabularyState?.currentWordIndex ?? 0) + 1;
    const progress = nextIndex / (vocabularyState?.words?.length || 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [incrementWordsCompleted, lessonId, handleNextWord, vocabularyState?.currentWordIndex, vocabularyState?.words?.length, progressAnim]);

  const completeLesson = useCallback(() => {
    // Stop the current word timer before completing
    if (vocabularyState?.currentWordStartTime) {
      stopWordTimer(lessonId!);
    }

    completeLessonCallback();

    // Calculate final score with proper null checking
    setVocabularyScore(lessonId!, Math.round(avgAccuracy));

    // Calculate total XP earned from all words
    const totalWordXP = vocabularyState?.wordXpScores?.reduce((sum, xp) => sum + xp, 0) ?? 0;

    // Calculate time bonus XP based on overall performance
    const avgWordTime = vocabularyState?.wordTimers && vocabularyState.wordTimers.length > 0
      ? vocabularyState.wordTimers.reduce((sum, time) => sum + time, 0) / vocabularyState.wordTimers.length
      : 0;

    let timeBonusXP = 0;
    if (avgWordTime > 0 && avgWordTime <= 20) {
      timeBonusXP = Math.floor(50 * (1 - avgWordTime / 20)); // Up to 50 bonus XP for fast completion
    }

    if (timeBonusXP > 0) {
      addVocabularyTimeBonusXP(lessonId!, timeBonusXP);
    }

    setTimeout(() => {
      router.back();
    }, 3000);
  }, [vocabularyState?.currentWordStartTime, vocabularyState?.wordXpScores, vocabularyState?.wordTimers, completeLessonCallback, setVocabularyScore, lessonId, avgAccuracy, stopWordTimer, addVocabularyTimeBonusXP]);

  const skipWord = useCallback(() => {
    handleNextWord();
  }, [handleNextWord]);

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
    const totalXP = vocabularyState?.wordXpScores?.reduce((sum, xp) => sum + xp, 0) ?? 0;
    const timeBonusXP = vocabularyState?.currentTimeBonusXP ?? 0;

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Animated.View style={[styles.completionContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.completionTitle, { color: theme.colors.primary }]}>🎉 Lesson Complete!</Text>

          <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Text style={[styles.completionScore, { color: theme.colors.onBackground }]}>
              Final Score: {vocabularyState?.score ?? 0}%
            </Text>
            <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
              Words Completed: {vocabularyState?.wordsCompleted ?? 0}
            </Text>
            <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
              Average Accuracy: {Math.round(vocabularyState?.pronunciationAccuracy ?? 0)}%
            </Text>
            <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
              Total Time: {totalSessionMinutes}:{totalSessionSeconds.toString().padStart(2, '0')}
            </Text>
          </Surface>

          <Surface style={[styles.xpCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
            <Text style={[styles.xpTitle, { color: theme.colors.onPrimaryContainer }]}>XP Earned</Text>
            <Text style={[styles.xpTotal, { color: theme.colors.onPrimaryContainer }]}>
              {totalXP + timeBonusXP} XP
            </Text>
            <Text style={[styles.xpBreakdown, { color: theme.colors.onPrimaryContainer }]}>
              Base XP: {totalXP}
            </Text>
            {timeBonusXP > 0 && (
              <Text style={[styles.xpBreakdown, { color: theme.colors.onPrimaryContainer }]}>
                Time Bonus: +{timeBonusXP}
              </Text>
            )}
          </Surface>
        </Animated.View>
      </View>
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
          <Card style={[styles.wordCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.wordText, { color: theme.colors.onSurface }]}>
              {currentWord.word}
            </Text>
            <Text style={[styles.phoneticText, { color: theme.colors.primary }]}>
              {currentWord.phonetic}
            </Text>
            <Text style={[styles.definitionText, { color: theme.colors.onSurface }]}>
              {currentWord.definition}
            </Text>
            <Text style={[styles.exampleText, { color: theme.colors.onSurfaceVariant }]}>
              "{currentWord.example}"
            </Text>
          </Card>

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

          {vocabularyState?.showFeedback && vocabularyState?.feedback && (
            <Surface
              style={[
                styles.feedbackContainer,
                { backgroundColor: theme.colors.secondaryContainer }
              ]}
              elevation={2}
            >
              <Text
                style={[styles.feedbackText, { color: theme.colors.onSecondaryContainer }]}
                accessibilityLabel={`Pronunciation feedback: ${vocabularyState?.feedback}`}
              >
                {vocabularyState?.feedback}
              </Text>
            </Surface>
          )}

          {/* Restart Button */}
          <View style={styles.restartContainer}>
            <Button
              mode="outlined"
              onPress={handleRestartLesson}
              style={styles.restartButton}
              disabled={isProcessing}
              accessibilityLabel="Restart lesson"
              accessibilityHint="Tap to restart the entire vocabulary lesson from the beginning"
              icon="restart"
            >
              🔄 Restart Lesson
            </Button>
          </View>

          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              onPress={skipWord}
              style={styles.skipButton}
              disabled={isProcessing}
              accessibilityLabel="Skip current word"
              accessibilityHint="Tap to skip this word and move to the next one"
            >
              Skip
            </Button>

            {/* Pause/Resume Button */}
            {vocabularyState?.currentWordStartTime && (
              <Button
                mode="outlined"
                onPress={() => {
                  if (vocabularyState.isPaused) {
                    resumeWordTimer(lessonId!);
                  } else {
                    pauseWordTimer(lessonId!);
                  }
                }}
                style={styles.pauseButton}
                disabled={isProcessing}
                accessibilityLabel={vocabularyState.isPaused ? 'Resume timer' : 'Pause timer'}
              >
                {vocabularyState.isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}

            {recordingUri && !vocabularyState?.showFeedback && (
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
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
  feedbackContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
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
});