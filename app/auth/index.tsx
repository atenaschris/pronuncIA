import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNPText } from '@/components/ui/RNPText';
import { RNPView } from '@/components/ui/RNPView';
import { useAuthStore } from '@/lib/store/auth-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Divider, TextInput } from 'react-native-paper';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);

  const handleEmailSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithEmail(email);
      // Success message will be shown by the auth store
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setError('Biometric authentication is not available on this device');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setError('No biometric enrollments found');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in with biometrics',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        // Handle successful biometric auth
        // You might want to implement a specific sign-in method here
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RNESafeAreaView style={styles.container}>
      <RNPView style={styles.animationContainer}>
        <LottieView
          source={require('@/assets/animations/circle-grow-animation.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </RNPView>

      <RNPView style={styles.content}>
        <RNPText variant="displayLarge" style={styles.title}>
          Welcome Back
        </RNPText>
        <RNPText variant="headlineSmall" style={styles.subtitle}>
          Sign in to access your personalized learning experience
        </RNPText>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />

        {error && (
          <RNPText variant="titleMedium" style={styles.error}>{error}</RNPText>
        )}

        <Button
          mode="contained"
          onPress={handleEmailSignIn}
          loading={isLoading}
          style={styles.button}
        >
          Continue with Email
        </Button>

        <Button
          mode="outlined"
          onPress={handleBiometricAuth}
          icon="fingerprint"
          style={styles.button}
        >
          Use Biometrics
        </Button>

        <RNPView style={styles.divider}>
          <Divider style={styles.line} />
          <RNPText style={styles.orText}>or</RNPText>
          <Divider style={styles.line} />
        </RNPView>

        <Button
          mode="outlined"
          icon="google"
          style={styles.button}
          // TODO: Implement Google Sign In
          onPress={() => {}}
        >
          Continue with Google
        </Button>

        <Button
          mode="outlined"
          icon="apple"
          style={styles.button}
          // TODO: Implement Apple Sign In
          onPress={() => {}}
        >
          Continue with Apple
        </Button>

        <RNPView style={styles.footer}>
          <RNPText variant="headlineSmall">Don't have an account? </RNPText>
          <Link href="/auth/register" asChild>
            <Button mode="text">Sign Up</Button>
          </Link>
        </RNPView>
      </RNPView>
    </RNESafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animationContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  animation: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.2 }],
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
    marginVertical: 12,
  },
  error: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  orText: {
    marginHorizontal: 8,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});
