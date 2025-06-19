import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { StyleSheet } from 'react-native';

interface OnboardingTypographyProps {
  children: React.ReactNode;
}

export function OnboardingTitle({ children }: OnboardingTypographyProps) {
  const theme = useAppTheme();

  return (
    <RNPText variant="displayMedium" style={[styles.title, { color: theme.colors.primary,textAlign:'center' }]}>
      {children}
    </RNPText>
  );
}

export function OnboardingSubtitle({ children }: OnboardingTypographyProps) {
  const theme = useAppTheme();

  return (
    <RNPText variant="titleLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant,textAlign:'center' }]}>
      {children}
    </RNPText>
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