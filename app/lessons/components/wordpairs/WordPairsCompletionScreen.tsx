import { PortalModal } from '@/components/ui/portal';
import { useAppTheme } from '@/components/ui/theme';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import { usePortalModalStore } from '@/lib/store/portal-modal-store';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WordPairsCompletionScreenProps {
  lessonId: LessonType;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const WordPairsCompletionScreen: React.FC<WordPairsCompletionScreenProps> = ({ lessonId }) => {
  const theme = useAppTheme();
  const { getLesson, getWordPairsState, clearCurrentSetErrors, setCurrentSetIndex, setIsReplayingForErrors, setCurrentSetCompleted } = useLessonStore();
  const { visible: modalVisible, content: modalContent, modalId, hideModal } = usePortalModalStore();

  const wordPairsState = getWordPairsState(lessonId);
  const lesson = getLesson(lessonId);

  if (!lesson || !lesson.completed) {
    return null;
  }

  // Ensure completion screen shows by default when revisiting a completed lesson
  useEffect(() => {
    setIsReplayingForErrors(lessonId, false);
  }, [lessonId, setIsReplayingForErrors]);

  const totalXP = lesson.xpReward || 0;
  const baseXP = totalXP - (lesson.currentTimeBonusXP || 0);
  const totalSeconds = wordPairsState?.totalSessionTime || 0;
  const totalTime = formatTime(totalSeconds);
  const completedSets = lesson.completedSets || 0;
  const totalSets = lesson.totalSets || 0;

  // Derive speed category from average time per set (same thresholds used in modal)
  const averageTimePerSet = totalSets > 0 ? Math.round(totalSeconds / totalSets) : totalSeconds;
  const timeCategory = (() => {
    if (averageTimePerSet <= 30) return 'Lightning Fast';
    if (averageTimePerSet <= 45) return 'Very Fast';
    if (averageTimePerSet <= 60) return 'Fast';
    if (averageTimePerSet <= 90) return 'Good';
    return 'Take Your Time';
  })();

  type ErrorMatch = { nativeWord: string; attemptedTranslation: string; correctTranslation: string; timestamp: number; setIndex: number; };
  const errorsBySet = (() => {
    const details = wordPairsState?.errorDetails;
    if (!details || !details.incorrectMatches || details.totalErrors === 0) return {} as Record<number, ErrorMatch[]>;
    return details.incorrectMatches.reduce((acc, err) => {
      if (!acc[err.setIndex]) acc[err.setIndex] = [];
      acc[err.setIndex].push(err);
      return acc;
    }, {} as Record<number, ErrorMatch[]>);
  })();

  const hasErrors = Object.keys(errorsBySet).length > 0;

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.completionContainer}>
            <Text style={[styles.completionTitle, { color: theme.colors.primary }]}>🎉 Lesson Complete!</Text>

            <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Text style={[styles.completionScore, { color: theme.colors.onBackground }]}>Final Score: {totalXP} XP</Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>Base XP: {baseXP} XP</Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>Sets Completed: {completedSets} / {totalSets}</Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>Total Time: {totalTime}</Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>Avg Time/Set: {formatTime(averageTimePerSet)}</Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>Speed Bonus: +{lesson.currentTimeBonusXP || 0} XP ({timeCategory})</Text>
            </Surface>

            {!hasErrors && (
              <Surface style={[styles.wordsCard, { backgroundColor: theme.colors.success }]} elevation={2}>
                <Text style={[styles.wordsTitle]}>✅ Perfect!</Text>
                <Text style={[styles.wordsSubtitle]}>You mastered all sets with no errors.</Text>
              </Surface>
            )}

            {hasErrors && (
              <Surface style={[styles.wordsCard, { backgroundColor: theme.colors.errorContainer }]} elevation={2}>
                <Text style={[styles.wordsTitle, { color: theme.colors.onErrorContainer }]}>⚠️ Sets With Errors</Text>
                <Text style={[styles.wordsSubtitle, { color: theme.colors.onErrorContainer }]}>Review and fix specific sets to improve your score.</Text>
                {Object.keys(errorsBySet).map((key) => {
                  const setIdx = parseInt(key, 10);
                  const errorCount = errorsBySet[setIdx].length;
                  return (
                    <View key={setIdx} style={[styles.incompleteWordItem, { borderBottomColor: theme.colors.outline }]}>
                      <View style={styles.incompleteWordInfo}>
                        <Text style={[styles.incompleteWordText, { color: theme.colors.onErrorContainer }]}>Set {setIdx + 1}</Text>
                        <Text style={[styles.incompleteWordPhonetic, { color: theme.colors.onErrorContainer }]}>{errorCount} error{errorCount > 1 ? 's' : ''}</Text>
                      </View>
                      <Button
                        mode="contained"
                        onPress={() => {
                          // Ensure no modal overlays block interactions
                          hideModal();
                          // Clear errors for this set and resume game on that set
                          clearCurrentSetErrors(lessonId, setIdx);
                          setCurrentSetCompleted(lessonId, false);
                          setIsReplayingForErrors(lessonId, true);
                          setCurrentSetIndex(lessonId, setIdx);
                        }}
                        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                        labelStyle={{ color: theme.colors.onPrimary }}
                        compact
                      >
                        Fix Set
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
          </View>
        </ScrollView>
      </SafeAreaView>
      <PortalModal visible={modalVisible} content={modalContent} onClose={hideModal} id={modalId} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  completionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  completionScore: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionStats: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  wordsCard: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  wordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  wordsSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  incompleteWordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  incompleteWordInfo: {
    flex: 1,
  },
  incompleteWordText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incompleteWordPhonetic: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  retryButton: {
    marginLeft: 10,
  },
  continueButton: {
    marginTop: 20,
    width: '100%',
  },
});