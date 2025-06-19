import React from 'react';
import { TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from './theme';

export interface RNPTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  variant?: 'displayLarge' | 'displayMedium' | 'displaySmall' | 'headlineLarge' | 'headlineMedium' | 'headlineSmall' | 'titleLarge' | 'titleMedium' | 'titleSmall' | 'labelLarge' | 'labelMedium' | 'labelSmall' | 'bodyLarge' | 'bodyMedium' | 'bodySmall';
  [key: string]: any;
}

export const RNPText: React.FC<RNPTextProps> = ({ children, style, variant = 'bodyMedium', ...props }) => {
  const theme = useAppTheme();
  
  return (
    <Text
      variant={variant}
      style={[
        { color: theme.colors.onSurface },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};