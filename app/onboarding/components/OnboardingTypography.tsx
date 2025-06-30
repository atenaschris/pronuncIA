import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { StyleSheet, TextProps } from 'react-native';

interface OnboardingTypographyProps extends TextProps {
  children: React.ReactNode;
}

export function OnboardingTitle({ children, style, ...props }: OnboardingTypographyProps) {

  const theme = useAppTheme();

  return (
    <RNPText variant="displayMedium" style={[styles.title, { color: theme.colors.primary, textAlign: 'center' }, style]} {...props}>
      {children}
    </RNPText>
  );
}

export function OnboardingSubtitle({ children, style, ...props }: OnboardingTypographyProps) {
  const theme = useAppTheme();

  return (
    <RNPText variant="titleLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant, textAlign: 'center' }, style]} {...props}>
      {children}
    </RNPText>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontWeight: "bold"
  },
  subtitle: {
    lineHeight: 24,
  },
});