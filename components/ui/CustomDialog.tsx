import { RNPView } from '@/components/ui/RNPView';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { useAppTheme } from './theme';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface DialogContent {
  title: string;
  message: string;
  buttons: DialogButton[];
}

interface CustomDialogProps {
  isVisible: boolean;
  content: DialogContent;
  onClose: () => void;
}

export function CustomDialog({ isVisible, content, onClose }: CustomDialogProps) {
  const theme = useAppTheme();

  const handleButtonPress = (button: DialogButton) => {
    onClose();
    button.onPress();
  };

  return (
    <Portal>
      <Modal
        visible={isVisible}
        onDismiss={onClose}
        contentContainerStyle={[
          styles.modalContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
          }
        ]}
      >
        <Text style={[
          styles.title,
          { color: theme.colors.onSurface }
        ]}>
          {content.title}
        </Text>
        
        <Text style={[
          styles.message,
          { color: theme.colors.onSurface }
        ]}>
          {content.message}
        </Text>
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
        >
        </ScrollView>
        
        <RNPView style={styles.buttonContainer}>
          {content.buttons.map((button, index) => (
            <Button
              key={index}
              mode={button.style === 'cancel' ? 'outlined' : 'contained'}
              onPress={() => handleButtonPress(button)}
              style={[
                styles.button,
                {
                  backgroundColor: button.style === 'destructive'
                    ? theme.colors.error
                    : button.style === 'cancel'
                      ? 'transparent'
                      : theme.colors.primary,
                }
              ]}
              labelStyle={{
                color: button.style === 'cancel' 
                  ? theme.colors.primary 
                  : button.style === 'destructive'
                    ? theme.colors.onError
                    : theme.colors.onPrimary,
                fontSize: 14,
                fontWeight: '600'
              }}
            >
              {button.text}
            </Button>
          ))}
        </RNPView>
      </Modal>
    </Portal>
  );
}

// Custom hook for managing dialog state
export function useCustomDialog() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [content, setContent] = React.useState<DialogContent>({
    title: '',
    message: '',
    buttons: []
  });


  const showDialog = React.useCallback((title: string, message: string, buttons: DialogButton[]) => {
    setContent({ title, message, buttons });
    setIsVisible(true);
  }, []);

  const hideDialog = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    content,
    showDialog,
    hideDialog
  };
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  buttonContainer: {
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    marginVertical: 5,
    minWidth: 120,
  },
});