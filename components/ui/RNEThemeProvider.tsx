import { ThemeProvider } from '@rneui/themed';
import React from 'react';
import { useColorScheme } from 'react-native';
import { theme } from './theme';

interface Props {
  children: React.ReactNode;
}

/**
 * React Native Elements ThemeProvider wrapper component
 * Provides theme context to all RNE components based on the app's color scheme
 */
export function RNEThemeProvider({ children }: Props) {
  // Use React Native's useColorScheme hook to detect system theme
  const colorScheme = useColorScheme();
  
  // Set the theme mode based on system preference
  theme.mode = colorScheme || 'light';

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}