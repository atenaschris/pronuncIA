import { LESSON_ICONS } from '@/lib/constants/constants';
import { Lesson, LessonType } from '@/lib/store/lesson-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { RNPText } from '../ui/RNPText';
import { RNPView } from '../ui/RNPView';
import { useAppTheme } from '../ui/theme';

interface LessonBlockProps {
  lesson: Lesson;
  onPress: (lessonType: LessonType) => void;
}

export function LessonBlock({ lesson, onPress }: LessonBlockProps) {
  const  theme  = useAppTheme();
  const dynamicStyles = {
    container: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 30,
    }
  }
  return (
    <RNPView style={[styles.container, dynamicStyles.container, lesson.completed && styles.completed]}>
      <Pressable
        onPress={() => onPress(lesson.type)}
        disabled={lesson.locked}
        style={({ pressed }) => [
          styles.pressable,
          lesson.locked && styles.disabled,
          pressed && styles.pressed
        ]}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <RNPText variant="headlineSmall" style={{color: theme.colors.primary}}>{lesson.title}</RNPText>
            <MaterialCommunityIcons
              name={LESSON_ICONS[lesson.type]}
              size={30}
              color={lesson.completed ? theme.colors.success : theme.colors.grey4 }
              style={{ marginLeft: 10 }}
            />
          </View>
          <View style={styles.belowLessonBlockContainer}>
            <RNPText variant="titleMedium" style={{fontWeight:'300'}}>{lesson.description}</RNPText>
            <View style={styles.xpAndLessonCompletedIconWrapper}>
            <RNPText variant="titleMedium" style={{fontWeight: '500',color: theme.colors.success}}>+{lesson.xpReward} XP</RNPText>
            {lesson.completed && (
              <MaterialCommunityIcons name="check-circle" size={25} color={theme.colors.success} />
            )}
            </View>
          </View>
        </View>
      </Pressable>
    </RNPView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  completed: {
    opacity: 0.8,
  },
  pressable: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    padding: 16,
    flexDirection: 'column',
    gap: 5,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  belowLessonBlockContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  xpAndLessonCompletedIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  }
});