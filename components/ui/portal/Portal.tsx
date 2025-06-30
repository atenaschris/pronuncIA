import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { usePortalStore } from '@/lib/store/portal-store';

interface PortalProviderProps {
  children: ReactNode;
}

export function PortalProvider({ children }: PortalProviderProps) {
  const portals = usePortalStore((state) => state.portals);

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.portalContainer} pointerEvents="box-none">
        {Array.from(portals.values()).map((portal, index) => (
          <View key={index} style={styles.portal}>
            {portal}
          </View>
        ))}
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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