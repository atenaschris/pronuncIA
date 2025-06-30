import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { darkTheme, lightTheme } from './theme';

interface RNPThemeProviderProps {
  children: React.ReactNode;
}

export const RNPThemeProvider: React.FC<RNPThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
};