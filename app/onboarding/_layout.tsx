import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="language-level" />
        <Stack.Screen name="native-language" />
        <Stack.Screen name="learning-goals" />
        <Stack.Screen name="time-commitment" />
        <Stack.Screen name="learning-style" />
        <Stack.Screen name="summary" />
      </Stack>
    </>
  );
}