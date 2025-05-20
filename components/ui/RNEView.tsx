import { useTheme } from '@rneui/themed';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps;

/**
 * React Native Elements themed View component
 * Use this component for consistent styling with RNE theme
 */
export function RNEView({ style, ...otherProps }: ThemedViewProps) {
  const { theme } = useTheme();
  return <View style={[{ backgroundColor: theme.colors.background }, style]} {...otherProps} />;
}

