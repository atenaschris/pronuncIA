import React from 'react';
import { ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from './theme';

export type RNESafeAreaViewProps = ViewProps & {
  // Additional props can be added here if needed
};

/**
 * React Native Elements themed SafeAreaView component
 * Use this component instead of RNESafeAreaView for consistent styling
 */
export function RNESafeAreaView({ style, children, ...otherProps }: RNESafeAreaViewProps) {
  const theme = useAppTheme();
  
  return (
    <SafeAreaView 
      style={[{ backgroundColor: theme.colors.background }, style]} 
      {...otherProps} 
    >
      {children}
      </SafeAreaView>
  );
}