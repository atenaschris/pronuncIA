import React from 'react';
import { Text, TextProps } from 'react-native-paper';

export interface RNPTextProps extends Omit<TextProps<never>, 'children'> {
  children: React.ReactNode;
}

export const RNPText: React.FC<RNPTextProps> = ({ children, variant = 'bodyMedium', ...props }) => {
  return (
    <Text
      variant={variant}
      {...props}
    >
      {children}
    </Text>
  );
};