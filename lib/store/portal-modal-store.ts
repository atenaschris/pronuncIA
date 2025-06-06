import { create } from 'zustand';

export interface PortalModalButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface PortalModalContent {
  title: string;
  message: string;
  buttons: PortalModalButton[];
}

interface PortalModalState {
  visible: boolean;
  content: PortalModalContent;
  modalId: string;
  showModal: (modalContent: PortalModalContent) => void;
  hideModal: () => void;
}

const defaultModalContent: PortalModalContent = {
  title: '',
  message: '',
  buttons: [],
};

export const usePortalModalStore = create<PortalModalState>((set) => ({
  visible: false,
  content: defaultModalContent,
  modalId: `portal-modal-${Date.now()}-${Math.random()}`,
  showModal: (modalContent: PortalModalContent) => {
    set({
      content: modalContent,
      visible: true,
      modalId: `portal-modal-${Date.now()}-${Math.random()}`,
    });
  },
  hideModal: () => {
    set({
      visible: false,
      content: defaultModalContent,
    });
  },
}));