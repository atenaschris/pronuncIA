import { zodResolver } from '@hookform/resolvers/zod';
import Slider from '@react-native-community/slider';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { z } from 'zod';
import { useOnboardingStore } from '../../../store/onboarding-store';

const schema = z.object({
  timeCommitment: z.number().min(5).max(60),
});

type FormData = z.infer<typeof schema>;

export function TimeCommitmentStep() {
  const { setTimeCommitment, setCurrentStep } = useOnboardingStore();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      timeCommitment: 15,
    },
  });

  const onSubmit = (data: FormData) => {
    setTimeCommitment(data.timeCommitment);
    setCurrentStep(5);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How much time can you commit?</Text>
        <Text style={styles.subtitle}>
          Choose your daily practice duration in minutes
        </Text>

        <Controller
          control={control}
          name="timeCommitment"
          render={({ field: { value, onChange } }) => (
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={60}
                step={5}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#000000"
              />
              <Text style={styles.valueText}>{value} minutes per day</Text>
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
  sliderContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
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