import { MD3DarkTheme, MD3LightTheme, configureFonts, useTheme } from 'react-native-paper';

// Custom font configuration
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
};

// Light theme with custom colors
export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0a7ea4',
    secondary: '#4ecdc4',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    error: '#ff190c',
    onError: '#ffffff',
    outline: '#bbb',
    outlineVariant: '#e1e8ee',
    inverseSurface: '#393e42',
    inverseOnSurface: '#ffffff',
    inversePrimary: '#2196f3',
    // Custom colors for compatibility
    success: '#52c41a',
    warning: '#faad14',
    disabled: 'hsl(208, 8%, 90%)',
    white: '#ffffff',
    black: '#000000',
    grey0: '#393e42',
    grey1: '#43484d',
    grey2: '#5e6977',
    grey3: '#86939e',
    grey4: '#bdc6cf',
    grey5: '#e1e8ee',
  } as const,
} as const;

// Dark theme with custom colors
export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196f3',
    secondary: '#00bcd4',
    background: '#121212',
    surface: '#121212',
    surfaceVariant: '#1e1e1e',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    error: '#f44336',
    onError: '#ffffff',
    outline: '#757575',
    outlineVariant: '#9e9e9e',
    inverseSurface: '#fafafa',
    inverseOnSurface: '#000000',
    inversePrimary: '#0a7ea4',
    // Custom colors for compatibility
    success: '#4caf50',
    warning: '#ff9800',
    disabled: 'hsl(208, 8%, 30%)',
    white: '#ffffff',
    black: '#000000',
    grey0: '#fafafa',
    grey1: '#f5f5f5',
    grey2: '#eeeeee',
    grey3: '#e0e0e0',
    grey4: '#bdbdbd',
    grey5: '#9e9e9e',
  } as const,
}as const;

export type LightAppTheme = typeof lightTheme;
export type DarkAppTheme = typeof darkTheme;

export const useAppTheme = () => useTheme<LightAppTheme | DarkAppTheme>();

