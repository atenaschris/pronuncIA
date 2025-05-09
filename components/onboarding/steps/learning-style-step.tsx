import { MaterialCommunityIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { z } from 'zod';
import { useOnboardingStore } from '../../../store/onboarding-store';

const schema = z.object({
  learningStyle: z.enum(['visual', 'audio', 'conversational']),
});

type FormData = z.infer<typeof schema>;

const styles = [
  {
    value: 'visual',
    label: 'Visual Learner',
    icon: 'eye',
    description: 'Learn through images, videos, and visual feedback',
  },
  {
    value: 'audio',
    label: 'Audio Learner',
    icon: 'headphones',
    description: 'Learn through listening and speaking exercises',
  },
  {
    value: 'conversational',
    label: 'Conversational Learner',
    icon: 'chat',
    description: 'Learn through interactive dialogues and role-play',
  },
];

export function LearningStyleStep() {
  const { setLearningStyle, setCurrentStep } = useOnboardingStore();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    setLearningStyle(data.learningStyle);
    setCurrentStep(6);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How do you learn best?</Text>
        <Text style={styles.subtitle}>
          Choose your preferred learning style
        </Text>

        <Controller
          control={control}
          name="learningStyle"
          render={({ field: { value, onChange } }) => (
            <View style={styles.cardsContainer}>
              {styles.map((style) => (
                <Card
                  key={style.value}
                  style={[
                    styles.card,
                    value === style.value && styles.selectedCard,
                  ]}
                  onPress={() => onChange(style.value)}
                >
                  <Card.Content style={styles.cardContent}>
                    <MaterialCommunityIcons
                      name={style.icon}
                      size={32}
                      color={value === style.value ? '#6200ee' : '#000'}
                    />
                    <Text style={styles.cardTitle}>{style.label}</Text>
                    <Text style={styles.cardDescription}>
                      {style.description}
                    </Text>
                  </Card.Content>
                </Card>
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
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 8,
  },
  selectedCard: {
    backgroundColor: '#f3e5f5',
    borderColor: '#6200ee',
    borderWidth: 2,
  },
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
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