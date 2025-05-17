import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Button, RadioButton } from 'react-native-paper';
import { z } from 'zod';
import { useOnboardingStore } from '../../../store/onboarding-store';

const schema = z.object({
  languageLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
});

type FormData = z.infer<typeof schema>;

const levels = [
  { value: 'A1', label: 'Beginner (A1)' },
  { value: 'A2', label: 'Elementary (A2)' },
  { value: 'B1', label: 'Intermediate (B1)' },
  { value: 'B2', label: 'Upper Intermediate (B2)' },
  { value: 'C1', label: 'Advanced (C1)' },
  { value: 'C2', label: 'Mastery (C2)' },
];

export function LanguageLevelStep() {
  const { setLanguageLevel, setCurrentStep } = useOnboardingStore();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      languageLevel: 'A1',
    },
  });

  const onSubmit = (data: FormData) => {
    setLanguageLevel(data.languageLevel);
    setCurrentStep(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your English level?</Text>
        <Text style={styles.subtitle}>
          Select your current level to personalize your learning experience
        </Text>

        <Controller
          control={control}
          name="languageLevel"
          render={({ field: { value, onChange } }) => (
            <RadioButton.Group onValueChange={onChange} value={value}>
              {levels.map((level) => (
                <View key={level.value} style={styles.radioItem}>
                  <RadioButton.Android value={level.value} />
                  <Text style={styles.radioLabel}>{level.label}</Text>
                </View>
              ))}
            </RadioButton.Group>
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
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
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