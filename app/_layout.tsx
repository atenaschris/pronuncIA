import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PortalProvider } from '@/components/ui/portal';
import { RNPThemeProvider } from '@/components/ui/RNPThemeProvider';
import { useAppTheme } from '@/components/ui/theme';
import { useOnboardingStore } from '@/lib/store/onboarding-store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function Layout() {
  const isComplete = useOnboardingStore((state) => state.isComplete);
  const segments = useSegments();

  React.useEffect(() => {
    if (!segments.length) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    if (isComplete && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!isComplete && inTabsGroup) {
      router.replace('/onboarding');
    }
  }, [isComplete, segments]);

  if (!segments.length) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="lessons" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
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
          <Layout />
          <StatusBar style="auto" />
        </PortalProvider>
      </SafeAreaProvider>
    </RNPThemeProvider>
  );
}
