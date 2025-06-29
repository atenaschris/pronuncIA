import { RNPText } from '@/components/ui/RNPText';
import { useAppTheme } from '@/components/ui/theme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
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
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.12,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionLabel: {
      color: theme.colors.onSurface,
    },
    optionDescription: {
      color: theme.colors.onSurfaceVariant,
    },
    selectedText: {
      color: theme.colors.onPrimary,
    },
  };

  return (
    <View style={[styles.container, containerStyle]}>
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
                  ...(isSelected ? [styles.selectedText, { color: theme.colors.white }] : []),

                  
                ]}
              >
                {option.label}
              </RNPText>
              {option.description && (
                <RNPText
                  variant="titleMedium"
                  style={[
                    styles.optionDescription,
                    ...(isSelected ? [styles.selectedText, { color: theme.colors.white }] : [])
                  ]}
                >
                  {option.description}
                </RNPText>
              )}

            </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    borderRadius: 20,
  },
  optionButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
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