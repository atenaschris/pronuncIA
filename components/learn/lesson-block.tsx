import { Lesson } from '@/store/lesson-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@rneui/themed';
import { Pressable, StyleSheet } from 'react-native';
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
  const { theme } = useTheme();
  const dynamicStyles = {
    container: {
      shadowColor: theme.colors.primary
    }
  }
  return (
    <Pressable
      style={[styles.container,dynamicStyles.container, lesson.completed && styles.completed]}
      onPress={() => onPress(lesson)}
      disabled={lesson.locked}
    >
      <RNEView style={styles.content}>
        <RNEView style={styles.titleContainer}>
          <RNEText h3 h3Style={{color: theme.colors.primary}}>{lesson.title}</RNEText>
          <MaterialCommunityIcons
            name={LESSON_ICONS[lesson.type]}
            size={30}
            color={lesson.completed ? theme.colors.success : theme.colors.grey4 }
            style={{ marginLeft: 10 }}
          />
        </RNEView>
        <RNEView style={styles.belowLessonBlockContainer}>
          <RNEText h4 h4Style={{fontWeight:'300'}}>{lesson.description}</RNEText>
          <RNEText h4 style={{fontWeight: '500',color: theme.colors.success}}>+{lesson.xpReward} XP</RNEText>
          {lesson.completed && (
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.success} />
          )}
        </RNEView>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completed: {
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,  
  },
  belowLessonBlockContainer: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    marginTop: 2,
  }
});