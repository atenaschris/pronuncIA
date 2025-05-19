import { NextButton } from '@/components/ui/NextButton';
import { RNESafeAreaView } from '@/components/ui/RNESafeAreaView';
import { H2, H4 } from '@/components/ui/RNEText';
import { RNEView } from '@/components/ui/RNEView';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
    <RNESafeAreaView style={[styles.container]}>
      <RNEView style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </RNEView>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <H2 style={styles.title}>
          Welcome to PronuncIA
        </H2>
        <H4 style={styles.subtitle}>
          Your AI-powered English pronunciation coach
        </H4>

        <RNEView style={styles.spacer} />

        <Animated.View>
          <NextButton
            title="Get Started"
            onPress={() => router.push('/onboarding/language-level')}
          />
        </Animated.View>
      </Animated.View>
    </RNESafeAreaView>
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
  },
  subtitle: {
    marginBottom: 20,
  },
  spacer: {
    height: 20,
  },
});
