import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';


export default function ProgressScreen() {

  return (
    <SafeAreaView style={[styles.container]}>
      <View>
        <OnboardingTitle>Progress</OnboardingTitle>
        <OnboardingSubtitle style={{ marginBottom: 20 }}>Track your learning journey
        </OnboardingSubtitle>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
});