import { Lesson } from '@/store/lesson-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { RNEText } from '../ui/RNEText';
import { RNEView } from '../ui/RNEView';

interface LessonBlockProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
}

const LESSON_ICONS = {
  vocabulary: 'book-open-variant',
  listening: 'headphones',
  pronunciation: 'microphone',
  roleplay: 'account-tie-voice',
  shadowing: 'account-voice-off',
  voice_journaling: 'notebook',
  word_pairs: 'cards-outline',
} as const;

export function LessonBlock({ lesson, onPress }: LessonBlockProps) {
  return (
    <Pressable
      style={[styles.container, lesson.completed && styles.completed]}
      onPress={() => onPress(lesson)}
      disabled={lesson.locked}
    >
      <RNEView style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={LESSON_ICONS[lesson.type]}
            size={24}
            color={lesson.completed ? '#4CAF50' : '#666'}
          />
        </View>

        <View style={styles.textContainer}>
          <RNEText h3 style={styles.title}>{lesson.title}</RNEText>
          <RNEText  h3 style={styles.description}>{lesson.description}</RNEText>
        </View>

        <View style={styles.rewardContainer}>
          <RNEText h3 style={styles.xpText}>+{lesson.xpReward} XP</RNEText>
          {lesson.completed && (
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          )}
        </View>
      </RNEView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    marginTop: 2,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpText: {
    fontWeight: '500',
    color: '#4CAF50',
  },
});