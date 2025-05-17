import LottieView from 'lottie-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useOnboardingStore } from '../../../store/onboarding-store';

export function WelcomeStep() {
  const { setCurrentStep } = useOnboardingStore();

  const handleGetStarted = () => {
    setCurrentStep(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../../../assets/animations/welcome-animation.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to PronuncIA</Text>
        <Text style={styles.subtitle}>
          Your AI-powered English pronunciation coach
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleGetStarted}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  animationContainer: {
    width: '80%',
    aspectRatio: 1,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    width: '80%',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 18,
    paddingVertical: 4,
  },
});