import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedText } from '@/components/ThemedText';
import { useAuthStore } from '@/store/auth-store';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
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
    <ThemedSafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Create Account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Start your personalized learning journey
        </ThemedText>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
        />

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.button}
        >
          Sign Up with Email
        </Button>

        <View style={styles.footer}>
          <ThemedText>Already have an account? </ThemedText>
          <Link href="/auth" asChild>
            <Button mode="text" compact>Sign In</Button>
          </Link>
        </View>
      </View>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
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
