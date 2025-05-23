import { Stack } from 'expo-router';
import React from 'react';

export default function LessonLayout() {
  return (
    <Stack>
      <Stack.Screen name="vocabulary" options={{ title: 'Vocabulary Lesson', headerShown: false  }} />
      <Stack.Screen name="listening" options={{ title: 'Listening Lesson', headerShown: false  }} />
      <Stack.Screen name="pronunciation" options={{ title: 'Pronunciation Lesson', headerShown: false  }} />
      <Stack.Screen name="roleplay" options={{ title: 'Roleplay Lesson', headerShown: false  }} />
      <Stack.Screen name="shadowing" options={{ title: 'Shadowing Lesson', headerShown: false  }} />
      <Stack.Screen name="voice-journaling" options={{ title: 'Voice Journaling', headerShown: false  }} />
      <Stack.Screen name="word-pairs" options={{ title: 'Word Pairs Lesson', headerShown: false  }} />
    </Stack>
  );
}