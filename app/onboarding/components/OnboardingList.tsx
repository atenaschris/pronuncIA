import { RNPText } from '@/components/ui/RNPText';
import { RNPView } from '@/components/ui/RNPView';
import { useAppTheme } from '@/components/ui/theme';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface OnboardingOption {
  id: string;
  label: string;
  description?: string;
}

interface OnboardingListProps<T extends OnboardingOption> {
  options: readonly T[];
  selectedValue: T['id'];
  onSelect: (value: T['id']) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function OnboardingList<T extends OnboardingOption>({ options, selectedValue, onSelect, containerStyle }: OnboardingListProps<T>) {
  const theme = useAppTheme();

  const themeStyles = {
    optionButton: {
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.05,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      shadowOpacity: 0.15,
      elevation: 4,
    },
    optionLabel: {
      color: theme.colors.onBackground,
    },
    optionDescription: {
      color: theme.colors.onSurfaceVariant,
    },
    selectedText: {
      color: theme.colors.onPrimary,
    },
  };

  return (
    <RNPView style={[styles.container, containerStyle]}>
      {options.map((option) => {
        const isSelected = option.id === selectedValue;
        return (
            <Animated.View
              style={[
                styles.optionButton,
                themeStyles.optionButton,
                isSelected && themeStyles.selectedOption,
              ]}
              onTouchEnd={() => onSelect(option.id)}
              key={option.id.toString()}
            >
              <RNPText
                variant="titleLarge"
                style={[
                  styles.optionLabel,
                  ...(isSelected ? [styles.selectedText] : [])
                ]}
              >
                {option.label}
              </RNPText>
              {option.description && (
                <RNPText
                  variant="titleMedium"
                  style={[
                    styles.optionDescription,
                    ...(isSelected ? [styles.selectedText] : [])
                  ]}
                >
                  {option.description}
                </RNPText>
              )}

            </Animated.View>
        );
      })}
    </RNPView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  optionButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  optionLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    opacity: 0.8,
    lineHeight: 22,
  },
  selectedText: {
    opacity: 1,
  },
});