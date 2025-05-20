import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { RNEText } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@rneui/themed';
import * as LocalAuthentication from 'expo-local-authentication';
import { Link } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

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
      <RNEView style={styles.animationContainer}>
        <LottieView
          source={require('@/assets/animations/circle-grow-animation.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </RNEView>

      <RNEView style={styles.content}>
        <RNEText h1 style={styles.title}>
          Welcome Back
        </RNEText>
        <RNEText h3 style={styles.subtitle}>
          Sign in to access your personalized learning experience
        </RNEText>

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
          <RNEText h4 style={styles.error}>{error}</RNEText>
        )}

        <Button
          title="Continue with Email"
          onPress={handleEmailSignIn}
          loading={isLoading}
          containerStyle={styles.button}
          raised
        />

        <Button
          title="Use Biometrics"
          onPress={handleBiometricAuth}
          icon={{ name: 'fingerprint', type: 'material' }}
          containerStyle={styles.button}
          type="outline"
        />

        <RNEView style={styles.divider}>
          <RNEView style={styles.line} />
          <RNEText style={styles.orText}>or</RNEText>
          <RNEView style={styles.line} />
        </RNEView>

        <Button
          title="Continue with Google"
          icon={{ name: 'google', type: 'font-awesome' }}
          containerStyle={styles.button}
          type="outline"
          // TODO: Implement Google Sign In
          onPress={() => {}}
        />

        <Button
          title="Continue with Apple"
          icon={{ name: 'apple', type: 'font-awesome' }}
          containerStyle={styles.button}
          type="outline"
          // TODO: Implement Apple Sign In
          onPress={() => {}}
        />

        <RNEView style={styles.footer}>
          <RNEText h3>Don't have an account? </RNEText>
          <Link href="/auth/register" asChild>
            <Button type="clear" title="Sign Up" />
          </Link>
        </RNEView>
      </RNEView>
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
