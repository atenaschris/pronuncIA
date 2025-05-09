import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Searchbar } from 'react-native-paper';
import { z } from 'zod';
import { useOnboardingStore } from '../../../store/onboarding-store';

const schema = z.object({
  nativeLanguage: z.string().min(1, 'Please select your native language'),
});

type FormData = z.infer<typeof schema>;

const languages = [
  'Arabic',
  'Bengali',
  'Chinese',
  'French',
  'German',
  'Hindi',
  'Indonesian',
  'Italian',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Spanish',
  'Turkish',
  'Vietnamese',
];

export function NativeLanguageStep() {
  const { setNativeLanguage, setCurrentStep } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = (data: FormData) => {
    setNativeLanguage(data.nativeLanguage);
    setCurrentStep(3);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your native language?</Text>
        <Text style={styles.subtitle}>
          This helps us provide better pronunciation guidance
        </Text>

        <Controller
          control={control}
          name="nativeLanguage"
          render={({ field: { value, onChange } }) => (
            <View>
              <Searchbar
                placeholder="Search languages"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
              />
              <View style={styles.languageList}>
                {filteredLanguages.map((lang) => (
                  <Button
                    key={lang}
                    mode={value === lang ? 'contained' : 'outlined'}
                    onPress={() => onChange(lang)}
                    style={styles.languageButton}
                  >
                    {lang}
                  </Button>
                ))}
              </View>
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
  searchbar: {
    marginBottom: 16,
    borderRadius: 8,
  },
  languageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    marginBottom: 8,
    borderRadius: 8,
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