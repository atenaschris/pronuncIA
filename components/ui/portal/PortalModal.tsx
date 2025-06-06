import { PortalModalButton, PortalModalContent } from '@/lib/store/portal-modal-store';
import { useTheme } from '@rneui/themed';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePortalStore } from '@/lib/store/portal-store';

interface PortalModalProps {
  visible: boolean;
  content: PortalModalContent;
  onClose: () => void;
  id: string;
}

export function PortalModal({ visible, content, onClose, id }: PortalModalProps) {
  const { theme } = useTheme();
  const addPortal = usePortalStore((state) => state.addPortal);
  const removePortal = usePortalStore((state) => state.removePortal);
  const { width, height } = Dimensions.get('window');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const handleButtonPress = useCallback((button: PortalModalButton) => {
    button.onPress();
    onClose();
  }, [onClose]);

  const getButtonStyle = useCallback((button: PortalModalButton) => {
    const baseStyle = {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginVertical: 4,
      alignItems: 'center' as const,
    };

    switch (button.style) {
      case 'cancel':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.grey3,
        };
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.error,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
        };
    }
  }, [theme.colors.grey3, theme.colors.primary]);

  const getButtonTextColor = useCallback((button: PortalModalButton) => {
    switch (button.style) {
      case 'cancel':
        return theme.colors.black;
      default:
        return theme.colors.white;
    }
  }, [theme.colors.black, theme.colors.white]);

  // Create portal content with stable reference
  const portalContent = useCallback(() => (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      <Pressable style={styles.overlayPressable} onPress={onClose} />
      <Animated.View 
        style={[
          styles.modalContainer, 
          { 
            maxWidth: width * 0.9, 
            maxHeight: height * 0.8,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={[styles.modal, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.title, { color: theme.colors.black }]}>
            {content.title}
          </Text>
          
          <ScrollView 
            style={styles.messageContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageContent}
          >
            <Text style={[styles.message, { color: theme.colors.black }]}>
              {content.message}
            </Text>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            {content.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={getButtonStyle(button)}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: getButtonTextColor(button) }]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  ), [fadeAnim, scaleAnim, width, height, theme.colors.primary, theme.colors.black, content, onClose, getButtonStyle, handleButtonPress, getButtonTextColor]);

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Add to portal
      addPortal(id, portalContent());
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        removePortal(id);
      });
    }
  }, [visible, id, fadeAnim, scaleAnim, addPortal, removePortal, portalContent]);

  // This component doesn't render anything directly
  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  overlayPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    zIndex: 10001,
    position: 'relative',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  messageContent: {
    flexGrow: 1,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});