import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RNEThemeProvider } from '@/components/ui/RNEThemeProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }


  return (
    <SafeAreaProvider>
      <RNEThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {!useOnboardingStore.getState().isComplete ? (
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          ) : 
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          }
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </RNEThemeProvider>
    </SafeAreaProvider>
  );
}
