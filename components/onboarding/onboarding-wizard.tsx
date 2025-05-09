import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useOnboardingStore } from '../../store/onboarding-store';
import { LanguageLevelStep } from './steps/language-level-step';
import { LearningGoalsStep } from './steps/learning-goals-step';
import { LearningStyleStep } from './steps/learning-style-step';
import { NativeLanguageStep } from './steps/native-language-step';
import { SummaryStep } from './steps/summary-step';
import { TimeCommitmentStep } from './steps/time-commitment-step';
import { WelcomeStep } from './steps/welcome-step';

export function OnboardingWizard() {
  const { currentStep, completeOnboarding } = useOnboardingStore();

  const handleComplete = () => {
    completeOnboarding();
    router.replace('/auth');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <LanguageLevelStep />;
      case 2:
        return <NativeLanguageStep />;
      case 3:
        return <LearningGoalsStep />;
      case 4:
        return <TimeCommitmentStep />;
      case 5:
        return <LearningStyleStep />;
      case 6:
        return <SummaryStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.stepContainer}
      >
        {renderStep()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
});