import { Button, ButtonProps, useTheme } from '@rneui/themed';
export type NextButtonProps = ButtonProps;

/**
 * A custom Button component for navigation/progression actions
 * Implements consistent styling for next/forward actions across the app
 */
export function NextButton(props: NextButtonProps) {
    const { theme } = useTheme();
  return (
    <Button
      {...props}
      containerStyle={[{
        backgroundColor: 'transparent',
      }, props.containerStyle]}
      buttonStyle={[{
        backgroundColor: theme.colors.primary,
      }, props.buttonStyle]}
      titleStyle={[{
        color: theme.colors.white,
        fontWeight: 'bold',
      }, props.titleStyle]}
    />
  );
}