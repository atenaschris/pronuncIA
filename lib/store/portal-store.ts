import { create } from 'zustand';
import { ReactNode } from 'react';

interface PortalState {
  portals: Map<string, ReactNode>;
  addPortal: (id: string, content: ReactNode) => void;
  removePortal: (id: string) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  portals: new Map<string, ReactNode>(),
  addPortal: (id: string, content: ReactNode) => {
    set((state) => {
      const newPortals = new Map(state.portals);
      newPortals.set(id, content);
      return { portals: newPortals };
    });
  },
  removePortal: (id: string) => {
    set((state) => {
      const newPortals = new Map(state.portals);
      newPortals.delete(id);
      return { portals: newPortals };
    });
  },
}));