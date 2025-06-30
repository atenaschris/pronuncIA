import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSubtitle, OnboardingTitle } from '../onboarding/components/OnboardingTypography';


export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
       <View>
        <OnboardingTitle>Profile</OnboardingTitle>
        <OnboardingSubtitle style={{ marginBottom: 20 }}>Your profile information and settings will appear here.</OnboardingSubtitle>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    opacity: 0.8,
  },
});