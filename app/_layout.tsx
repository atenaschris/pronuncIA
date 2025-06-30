import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PortalProvider } from '@/components/ui/portal';
import { RNPThemeProvider } from '@/components/ui/RNPThemeProvider';
import { useAppTheme } from '@/components/ui/theme';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const isComplete = useOnboardingStore((state) => state.isComplete);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isComplete}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lessons" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isComplete}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const theme = useAppTheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

    React.useEffect(() => {
    if (error) throw error;
  }, [error]);

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RNPThemeProvider>
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
        <PortalProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </PortalProvider>
      </SafeAreaProvider>
    </RNPThemeProvider>
  );
}
