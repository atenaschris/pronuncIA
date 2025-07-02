import { useAppTheme } from '@/components/ui/theme';
import { VOCABULARY_WORD_SETS } from '@/lib/constants/constants';
import { useAudio } from '@/lib/hooks/use-audio';
import { useRecording } from '@/lib/hooks/use-recording';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
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
    startVocabularySession,
    updateSessionDuration,
    resetVocabularyLesson
  } = useLessonStore();

  const vocabularyState = getVocabularyState(lessonId!);
  const sessionStartTime = useRef(Date.now());
  const {
    recordingUri,
    isProcessing,
    isRecording,
    recordingDuration,
    setIsProcessing,
    setRecordingUri,
    startRecording,
    stopRecording,
    cleanup,
  } = useRecording();
  
  const [error, setError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Initialize lesson only once on mount
  useEffect(() => {
    initializeLesson();
  }, [lessonId]); // Only depend on lessonId to reinitialize when lesson changes

  // Update session duration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (vocabularyState && !vocabularyState.lessonCompleted) {
        updateSessionDuration(lessonId!);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [vocabularyState?.lessonCompleted, lessonId, updateSessionDuration]);

  // Cleanup recording on unmount only
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []); // No dependencies - only cleanup on unmount

  const initializeLesson = async () => {
    resetVocabularyLesson(lessonId!);
    // Start with consonants_th set for demo
    const words = VOCABULARY_WORD_SETS.consonants_th;
    setVocabularyWords(lessonId!,words);
    startVocabularySession(lessonId!);
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

  const sessionDuration = useMemo(() => {
    if (!vocabularyState?.sessionStartTime) return 0;
    return Date.now() - vocabularyState.sessionStartTime;
  }, [vocabularyState?.sessionStartTime]);

  // Memoized handlers for performance
  const handleNextWord = useCallback(() => {
    if (!vocabularyState?.words) return;
    
    const nextIndex = (vocabularyState.currentWordIndex ?? 0) + 1;
    if (nextIndex < vocabularyState.words.length) {
      setCurrentWordIndex(lessonId!, nextIndex);
      setRecordingUri(null);
      setShowFeedback(lessonId!, false);
      
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
  }, [vocabularyState?.words, vocabularyState?.currentWordIndex, lessonId, setCurrentWordIndex, setRecordingUri, setShowFeedback, fadeAnim]);

  const completeLessonCallback = useCallback(() => {
    setVocabularyCompleted(lessonId!, true);
    updateSessionDuration(lessonId!);
    playWin();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [lessonId, setVocabularyCompleted, updateSessionDuration, playWin]);

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
    completeLessonCallback();
    
    // Calculate final score with proper null checking
    setVocabularyScore(lessonId!, Math.round(avgAccuracy));
    
    setTimeout(() => {
      router.back();
    }, 3000);
  }, [completeLessonCallback, setVocabularyScore, lessonId, avgAccuracy]);

  const skipWord = useCallback(() => {
    handleNextWord();
  }, [handleNextWord]);



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
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Animated.View style={[styles.completionContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.completionTitle, { color: theme.colors.primary }]}>🎉 Lesson Complete!</Text>
          <Text style={[styles.completionScore, { color: theme.colors.onBackground }]}>
            Final Score: {vocabularyState?.score ?? 0}%
          </Text>
          <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
            Words Completed: {vocabularyState?.wordsCompleted ?? 0}
          </Text>
          <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
            Average Accuracy: {Math.round(vocabularyState?.pronunciationAccuracy ?? 0)}%
          </Text>
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
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    skipButton: {
      flex: 1,
      marginRight: 10,
    },
    nextButton: {
      flex: 1,
      marginLeft: 10,
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
  });