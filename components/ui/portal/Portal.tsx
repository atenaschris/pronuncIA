import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface PortalContextType {
  addPortal: (id: string, content: ReactNode) => void;
  removePortal: (id: string) => void;
}

const PortalContext = createContext<PortalContextType | null>(null);

interface PortalProviderProps {
  children: ReactNode;
}

export function PortalProvider({ children }: PortalProviderProps) {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const addPortal = (id: string, content: ReactNode) => {
    setPortals(prev => new Map(prev).set(id, content));
  };

  const removePortal = (id: string) => {
    setPortals(prev => {
      const newPortals = new Map(prev);
      newPortals.delete(id);
      return newPortals;
    });
  };

  return (
    <PortalContext.Provider value={{ addPortal, removePortal }}>
      {children}
      <View style={styles.portalContainer} pointerEvents="box-none">
        {Array.from(portals.values()).map((portal, index) => (
          <View key={index} style={styles.portal}>
            {portal}
          </View>
        ))}
      </View>
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  portalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  portal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});