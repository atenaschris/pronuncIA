import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text } from 'react-native-paper';

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
        <Text variant="headlineSmall" style={styles.title}>
          Sign in Required
        </Text>
        <Text variant="bodyLarge" style={styles.message}>
          {feature ? 
            `Please sign in to access ${feature}` :
            'Please sign in to access this feature'}
        </Text>

        <View style={styles.buttonContainer}>
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
        </View>
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