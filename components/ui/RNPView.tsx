import React, { ReactNode } from 'react';
import { ViewProps } from 'react-native';
import { Surface } from 'react-native-paper';
import { useAppTheme } from './theme';

export interface ThemedViewProps extends Omit<ViewProps, 'children'> {
  children: ReactNode;
  lightColor?: string;
  darkColor?: string;
  elevation?: number;
}

export function RNPView({ style, lightColor, darkColor, elevation = 0, children, ...otherProps }: ThemedViewProps) {
  const theme = useAppTheme();
  const backgroundColor = theme.colors.background;

  return (
    <Surface 
      style={[{ backgroundColor, elevation }, style]} 
      {...otherProps}
    >
      {children}
    </Surface>
  );
}

