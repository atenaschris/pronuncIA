import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { RNPText } from '../ui/RNPText';
import { RNPView } from '../ui/RNPView';

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
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <RNPText variant="headlineMedium" style={styles.title}>
          Sign in Required
        </RNPText>
        <RNPText style={styles.message}>
          {feature ? 
            `Please sign in to access ${feature}` :
            'Please sign in to access this feature'}
        </RNPText>

        <RNPView style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
          >
            Sign In
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleContinueAsGuest}
            style={styles.button}
          >
            Continue as Guest
          </Button>
        </RNPView>
      </Modal>
    </Portal>
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