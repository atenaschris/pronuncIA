import { useAuthStore } from '@/lib/store/auth-store';
import { Button, Overlay } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { RNEText } from '../ui/RNEText';
import { RNEView } from '../ui/RNEView';

interface AuthModalProps {
  visible: boolean;
  onDismiss: () => void;
  feature?: string;
}

export function AuthModal({ visible, onDismiss, feature }: AuthModalProps) {
  const router = useRouter();
  const canAccessFeature = useAuthStore((state) => state.canAccessFeature);

  const handleLogin = () => {
    onDismiss();
    router.push('/auth');
  };

  const handleContinueAsGuest = () => {
    onDismiss();
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onDismiss}
      overlayStyle={styles.container}
    >
      <RNEText h4 style={styles.title}>
        Sign in Required
      </RNEText>
      <RNEText style={styles.message}>
        {feature ? 
          `Please sign in to access ${feature}` :
          'Please sign in to access this feature'}
      </RNEText>

      <RNEView style={styles.buttonContainer}>
        <Button
          title="Sign In"
          onPress={handleLogin}
          containerStyle={styles.button}
          raised
        />
        
        <Button
          title="Continue as Guest"
          onPress={handleContinueAsGuest}
          containerStyle={styles.button}
          type="outline"
        />
      </RNEView>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
  },
  button: {
    width: '100%',
  },
});