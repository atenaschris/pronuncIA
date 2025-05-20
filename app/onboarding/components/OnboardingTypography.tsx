import { H2, H4 } from '@/components/ui/RNEText';
import { useTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';

interface OnboardingTypographyProps {
  children: React.ReactNode;
}

export function OnboardingTitle({ children }: OnboardingTypographyProps) {
  const { theme } = useTheme();

  return (
    <H2 style={[styles.title, { color: theme.colors.primary }]}>
      {children}
    </H2>
  );
}

export function OnboardingSubtitle({ children }: OnboardingTypographyProps) {
  const { theme } = useTheme();

  return (
    <H4 style={[styles.subtitle, { color: theme.colors.grey2 }]}>
      {children}
    </H4>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 32,
    lineHeight: 24,
  },
});