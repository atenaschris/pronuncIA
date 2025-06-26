import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';

export interface NextButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  [key: string]: any;
}

/**
 * A custom Button component for navigation/progression actions
 * Implements consistent styling for next/forward actions across the app
 */
export function NextButton({
  children,
  style,
  labelStyle,
  mode = 'contained',
  ...props
}: NextButtonProps) {
  return (
    <Button
      mode={mode}
      style={style}
      labelStyle={labelStyle}
      {...props}
    >
      {children}
    </Button>
  );
}