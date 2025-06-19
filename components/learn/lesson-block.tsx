import { LESSON_ICONS } from '@/lib/constants/constants';
import { Lesson, LessonType } from '@/lib/store/lesson-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
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
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 30,
    }
  }
  return (
    <RNPView style={[styles.container, dynamicStyles.container, lesson.completed && styles.completed]}>
      <Button
        mode="outlined"
        onPress={() => onPress(lesson.type)}
        disabled={lesson.locked}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
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
            <MaterialCommunityIcons name="check-circle" size={30} color={theme.colors.success} />
          )}
          </View>
          
        </View>
      </Button>
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
  button: {
    width: '100%',
  },
  buttonContent: {
    padding: 16,
    flexDirection: 'column',
  },
  content: {
    padding: 2,
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
  },
  xpAndLessonCompletedIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  }
});