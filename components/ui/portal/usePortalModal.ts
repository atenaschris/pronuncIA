import React, { useState, useCallback } from 'react';

interface PortalModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface PortalModalContent {
  title: string;
  message: string;
  buttons: PortalModalButton[];
}

export function usePortalModal() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<PortalModalContent>({
    title: '',
    message: '',
    buttons: [],
  });
  const [modalId] = useState(() => `portal-modal-${Date.now()}-${Math.random()}`);

  const showModal = useCallback((modalContent: PortalModalContent) => {
    setContent(modalContent);
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    visible,
    content,
    modalId,
    showModal,
    hideModal,
  };
}