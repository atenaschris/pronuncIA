import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button, Input } from '@rneui/themed';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
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
    <RNESafeAreaView style={styles.container}>
      <RNEView style={styles.content}>
        <RNEText h1 style={styles.title}>
          Create Account
        </RNEText>
        <RNEText h3 style={styles.subtitle}>
          Start your personalized learning journey
        </RNEText>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          containerStyle={styles.input}
          leftIcon={{ type: 'material', name: 'email' }}
        />

        {error && (
          <RNEText h4 style={styles.error}>{error}</RNEText>
        )}

        <Button
          title="Sign Up with Email"
          onPress={handleRegister}
          loading={isLoading}
          containerStyle={styles.button}
          raised
        />

        <RNEView style={styles.footer}>
          <RNEText h3>Already have an account? </RNEText>
          <Link href="/auth" asChild>
            <Button type="clear" title="Sign In" />
          </Link>
        </RNEView>
      </RNEView>
    </RNESafeAreaView>
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
