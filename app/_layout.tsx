import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PortalProvider } from '@/components/ui/portal';
import { RNPThemeProvider } from '@/components/ui/RNPThemeProvider';
import { useOnboardingStore } from '@/lib/store/onboarding-store';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Subscribe to the onboarding store state changes
  const isComplete = useOnboardingStore((state) => state.isComplete);

  console.log('Onboarding complete:', isComplete);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <RNPThemeProvider>
      <PortalProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {!isComplete ? (
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            )}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </PortalProvider>
    </RNPThemeProvider>
  );
}
