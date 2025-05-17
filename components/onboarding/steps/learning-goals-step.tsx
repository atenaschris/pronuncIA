import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { z } from 'zod';
import { useOnboardingStore } from '../../../store/onboarding-store';

const schema = z.object({
  learningGoals: z.array(z.enum(['travel', 'fluency', 'work', 'exam'])).min(1, 'Please select at least one goal'),
});

type FormData = z.infer<typeof schema>;

const goals = [
  { value: 'travel', label: '✈️ Travel' },
  { value: 'fluency', label: '🗣 General Fluency' },
  { value: 'work', label: '💼 Work & Business' },
  { value: 'exam', label: '📚 Exam Preparation' },
];

export function LearningGoalsStep() {
  const { setLearningGoals, setCurrentStep } = useOnboardingStore();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      learningGoals: [],
    },
  });

  const onSubmit = (data: FormData) => {
    setLearningGoals(data.learningGoals);
    setCurrentStep(4);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What are your learning goals?</Text>
        <Text style={styles.subtitle}>
          Select all that apply to customize your learning path
        </Text>

        <Controller
          control={control}
          name="learningGoals"
          render={({ field: { value, onChange } }) => (
            <View style={styles.goalsContainer}>
              {goals.map((goal) => (
                <Chip
                  key={goal.value}
                  selected={value.includes(goal.value)}
                  onPress={() => {
                    const newValue = value.includes(goal.value)
                      ? value.filter((v) => v !== goal.value)
                      : [...value, goal.value];
                    onChange(newValue);
                  }}
                  style={styles.chip}
                  mode="outlined"
                >
                  {goal.label}
                </Chip>
              ))}
            </View>
          )}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 32,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    marginBottom: 8,
  },
  button: {
    marginHorizontal: 20,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 18,
    paddingVertical: 4,
  },
});