import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
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