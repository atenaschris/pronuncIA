import { useAppTheme } from '@/components/ui/theme';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  const {colors:{black, white}} = useAppTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? black : white,
        },
        headerTintColor: colorScheme === 'dark' ? white : black,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Sign In'
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Create Account'
        }}
      />
    </Stack>
  );
}