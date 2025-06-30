import { RNPText } from '@/components/ui/RNPText';
import { RNPView } from '@/components/ui/RNPView';
import { useAuthStore } from '@/lib/store/auth-store';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate email
      const result = registerSchema.safeParse({ email });
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }

      // Use the same email sign-in flow for registration
      await signInWithEmail(email);
      router.push('/auth');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNPView style={styles.content}>
        <RNPText variant="displayLarge" style={styles.title}>
          Create Account
        </RNPText>
        <RNPText variant="headlineSmall" style={styles.subtitle}>
          Start your personalized learning journey
        </RNPText>

        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
        />

        {error && (
          <RNPText variant="titleMedium" style={styles.error}>{error}</RNPText>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        >
          Sign Up with Email
        </Button>

        <RNPView style={styles.footer}>
          <RNPText variant="headlineSmall">Already have an account? </RNPText>
          <Link href="/auth" asChild>
            <Button mode="text">Sign In</Button>
          </Link>
        </RNPView>
      </RNPView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap:15
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  error: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
