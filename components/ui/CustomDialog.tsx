import { RNEView } from '@/components/ui/RNEView';
import { Dialog, useTheme } from '@rneui/themed';
import React from 'react';
import { ScrollView } from 'react-native';

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
  const { theme } = useTheme();

  const handleButtonPress = (button: DialogButton) => {
    onClose();
    button.onPress();
  };

  return (
    <Dialog
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={{
        borderRadius: 12,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      }}
    >
      <Dialog.Title
        title={content.title}
        titleStyle={{
          color: theme.colors.black,
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      />
      <ScrollView
        style={{ maxHeight: 400, paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
      </ScrollView>
      <Dialog.Actions>
        <RNEView style={{
          justifyContent: 'space-around',
          width: '100%',
          paddingHorizontal: 10
        }}>
          {content.buttons.map((button, index) => (
            <Dialog.Button
              key={index}
              title={button.text}
              onPress={() => handleButtonPress(button)}
              buttonStyle={{
                backgroundColor: button.style === 'destructive'
                  ? theme.colors.error
                  : button.style === 'cancel'
                    ? theme.colors.grey3
                    : theme.colors.primary,
                borderRadius: 8,
                marginVertical: 5,
                minWidth: 120,
              }}
              titleStyle={{
                color: button.style === 'cancel' ? theme.colors.warning : theme.colors.white,
                fontSize: 14,
                fontWeight: '600'
              }}
            />
          ))}
        </RNEView>
      </Dialog.Actions>
    </Dialog>
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