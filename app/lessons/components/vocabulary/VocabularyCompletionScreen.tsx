import { PortalModal } from '@/components/ui/portal';
import { useAppTheme } from '@/components/ui/theme';
import { LessonType, useLessonStore } from '@/lib/store/lesson-store';
import { usePortalModalStore } from '@/lib/store/portal-modal-store';
import { KindOfWordFinalScreen } from '@/lib/types/vocabulary';
import { router } from 'expo-router';
import React from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VocabularyCompletionScreenProps {
  lessonId: LessonType;
  isProcessing: boolean;
  isRecording: boolean;
  scaleAnim: Animated.Value;
  handleRestartLesson: () => void;
  handleRetryWord: (wordIndex: number) => void;
}

// Helper function to calculate pronunciation accuracy on-demand from aiScores
const calculatePronunciationAccuracy = (aiScores: number[]): number => {
  if (aiScores.length === 0) return 0;
  const sum = aiScores.reduce((total, score) => total + score, 0);
  return Math.round(sum / aiScores.length);
};

export const VocabularyCompletionScreen: React.FC<VocabularyCompletionScreenProps> = ({
  lessonId,
  isProcessing,
  isRecording,
  scaleAnim,
  handleRestartLesson,
  handleRetryWord,
}) => {
  const theme = useAppTheme();
  const { getLesson, getVocabularyState } = useLessonStore();
  const { visible: modalVisible, content: modalContent, modalId, showModal, hideModal } = usePortalModalStore();

  const vocabularyState = getVocabularyState(lessonId);
  const lesson = getLesson(lessonId);

  if (!vocabularyState || !vocabularyState.lessonCompleted) {
    return null;
  }

  const totalSessionMinutes = Math.floor((vocabularyState.totalSessionTime ?? 0) / 60);
  const totalSessionSeconds = (vocabularyState.totalSessionTime ?? 0) % 60;
  const totalXP = lesson?.xpReward ?? 0;
  const averageWordAccurancy = calculatePronunciationAccuracy(vocabularyState.aiScores ?? []);
  const failedWords = vocabularyState.failedWords ?? [];
  const skippedWords = vocabularyState.skippedWords ?? [];
  const successWords = vocabularyState.successWords ?? [];

  const renderWordItem = (wordIndex: number, kindOfWord: KindOfWordFinalScreen) => {
    const word = vocabularyState.words?.[wordIndex];
    if (!word) return null;

    return (
      <View key={wordIndex} style={[styles.incompleteWordItem, { borderBottomColor: theme.colors.outline }]}>
        <View style={styles.incompleteWordInfo}>
          <Text style={[styles.incompleteWordText, { color: kindOfWord === 'skipped' ? theme.colors.onSecondaryContainer : theme.colors.onErrorContainer }]}>
            {word.word}
          </Text>
          <Text style={[styles.incompleteWordPhonetic, { color: kindOfWord === 'skipped' ? theme.colors.onSecondaryContainer : theme.colors.onErrorContainer }]}>
            {word.phonetic}
          </Text>
        </View>
        {
          (kindOfWord === 'failed' || kindOfWord === 'skipped') && <Button
            mode="contained"
            onPress={() => {
              const currentRetryCount = vocabularyState.wordRetryCount?.[wordIndex] ?? 0;
              const maxRetries = vocabularyState.maxRetries ?? 1;

              if (currentRetryCount >= maxRetries) {
                showModal({
                  title: 'Unlock Unlimited Retries! 🚀',
                  message: 'You\'ve already retried this word once with your current plan.\n\nUpgrade to Premium to get unlimited retries and master every word at your own pace!\n\n✨ Unlimited retries for all words\n🎯 Advanced pronunciation feedback\n📊 Detailed progress analytics',
                  buttons: [
                    {
                      text: 'Maybe Later',
                      style: 'cancel' as const,
                      onPress: () => hideModal(),
                    },
                    {
                      text: 'Upgrade Now',
                      onPress: () => {
                        hideModal();
                        console.log('Navigate to subscription screen');
                      },
                    },
                  ],
                });
              } else {
                handleRetryWord(wordIndex);
              }
            }}
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.onPrimary }}
            compact
          >
            Retry
          </Button>
        }
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.completionContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={[styles.completionTitle, { color: theme.colors.primary }]}>🎉 Lesson Complete!</Text>

            <Surface style={[styles.statsCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
              <Text style={[styles.completionScore, { color: theme.colors.onBackground }]}>
                Final Score: {totalXP} XP
              </Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
                Words Completed: {vocabularyState.completedWords?.length ?? 0}
              </Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
                Average Accuracy: {averageWordAccurancy}%
              </Text>
              <Text style={[styles.completionStats, { color: theme.colors.onSurfaceVariant }]}>
                Estimated Total Time: {totalSessionMinutes}:{totalSessionSeconds.toString().padStart(2, '0')}
              </Text>
            </Surface>
            {
              successWords.length > 0 && (
                <Surface style={[styles.wordsCard, { backgroundColor: theme.colors.success}]} elevation={2}>
                  <Text style={[styles.wordsTitle]}>
                    ✅ Success Words ({successWords.length})
                  </Text>
                  <Text style={[styles.wordsSubtitle]}>
                    Words you have pronounced correctly.
                  </Text>
                  {successWords.map((wordIndex) => renderWordItem(wordIndex, 'success'))}
                </Surface>
              )
            }

            {skippedWords.length > 0 && (
              <Surface style={[styles.wordsCard, { backgroundColor: theme.colors.secondaryContainer }]} elevation={2}>
                <Text style={[styles.wordsTitle]}>
                  ⏭️ Skipped Words ({skippedWords.length})
                </Text>
                <Text style={[styles.wordsSubtitle]}>
                  Words you chose to skip during the lesson
                </Text>
                {skippedWords.map((wordIndex) => renderWordItem(wordIndex, 'skipped'))}
              </Surface>
            )}

            {failedWords.length > 0 && (
              <Surface style={[styles.wordsCard, { backgroundColor: theme.colors.errorContainer }]} elevation={2}>
                <Text style={[styles.wordsTitle, { color: theme.colors.onErrorContainer }]}>
                  💪 Challenging Words ({failedWords.length})
                </Text>
                <Text style={[styles.wordsSubtitle, { color: theme.colors.onErrorContainer }]}>
                  Words that need more practice after 3 attempts
                </Text>
                {failedWords.map((wordIndex) => renderWordItem(wordIndex, 'failed'))}
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
  restartContainer: {
    marginTop: 10,
    width: '100%',
  },
  restartButton: {
    width: '100%',
  },
});