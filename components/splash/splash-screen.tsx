import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAuthStore } from '../../store/auth-store';
import { useOnboardingStore } from '../../store/onboarding-store';

export function SplashScreen() {
  const opacity = useSharedValue(0);
  const { isAuthenticated } = useAuthStore();
  const { isComplete } = useOnboardingStore();

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, { duration: 500 }),
  }));

  useEffect(() => {
    opacity.value = 1;
    
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else if (isComplete) {
        router.replace('/auth');
      } else {
        router.replace('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isComplete]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, fadeInStyle]}>
        <LottieView
          source={require('../../assets/animations/logo-animation.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '80%',
    aspectRatio: 1,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});