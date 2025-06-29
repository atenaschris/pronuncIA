import { RNPText } from '@/components/ui/RNPText';
import { StyleSheet, View } from 'react-native';

export default function PlannerScreen() {
  return (
    <View style={[styles.container]}>
      <RNPText variant="displayLarge" style={styles.title} >Planner</RNPText>
      <RNPText variant="headlineSmall" style={styles.subtitle}>
        Schedule your learning sessions
      </RNPText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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