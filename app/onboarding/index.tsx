import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const insets = useSafeAreaInsets();

  // Animation effect when component mounts
  useEffect(() => {
    // Set initial values
    opacity.value = 0;
    translateY.value = 20;
    
    // Start animations after a brief delay
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withTiming(0, { duration: 400 });
    }, 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <ThemedText type="title" style={styles.title}>
          Welcome to PronuncIA
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Your AI-powered English pronunciation coach
        </ThemedText>

        <View style={styles.spacer} />

        <Animated.View>
          <Link href="/onboarding/language-level" style={styles.button}>
            <ThemedText style={styles.buttonText}>Get Started</ThemedText>
          </Link>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  spacer: {
    height: 40,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
