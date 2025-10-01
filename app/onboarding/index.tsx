import { NextButton } from '@/components/ui/NextButton';
import { RNPView } from '@/components/ui/RNPView';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSubtitle, OnboardingTitle } from './components/OnboardingTypography';

export default function WelcomeScreen() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

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
    <SafeAreaView style={[styles.container]}>
      <RNPView style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </RNPView>
      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <OnboardingTitle>Welcome to PronuncIA</OnboardingTitle>
        <OnboardingSubtitle>Your AI-powered English pronunciation coach</OnboardingSubtitle>
        <Divider style={styles.spacer} />
        <Animated.View>
          <NextButton
          onPress={() => router.push('/onboarding/native-language')}
        >
          Get Started
        </NextButton>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  subtitle: {
    marginBottom: 20,
  },
  spacer: {
    height: 20,
  },
});
