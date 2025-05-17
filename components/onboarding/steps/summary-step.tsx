import LottieView from 'lottie-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useOnboardingStore } from '../../../store/onboarding-store';

interface Props {
  onComplete: () => void;
}

export function SummaryStep({ onComplete }: Props) {
  const {
    languageLevel,
    nativeLanguage,
    learningGoals,
    timeCommitment,
    learningStyle,
  } = useOnboardingStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Learning Path</Text>
        <Text style={styles.subtitle}>
          Here's your personalized learning profile
        </Text>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryItem}>
              <Text style={styles.label}>Current Level:</Text>
              <Text style={styles.value}>{languageLevel}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.label}>Native Language:</Text>
              <Text style={styles.value}>{nativeLanguage}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.label}>Learning Goals:</Text>
              <Text style={styles.value}>
                {learningGoals.map((goal) => {
                  switch (goal) {
                    case 'travel':
                      return '✈️ Travel';
                    case 'fluency':
                      return '🗣 Fluency';
                    case 'work':
                      return '💼 Work';
                    case 'exam':
                      return '📚 Exam';
                    default:
                      return goal;
                  }
                }).join(', ')}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.label}>Daily Commitment:</Text>
              <Text style={styles.value}>{timeCommitment} minutes</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.label}>Learning Style:</Text>
              <Text style={styles.value}>
                {learningStyle?.charAt(0).toUpperCase() + learningStyle?.slice(1)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../../assets/animations/success-animation.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={onComplete}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Start Learning
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 32,
  },
  summaryCard: {
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  animation: {
    width: 200,
    height: 200,
  },
  button: {
    marginHorizontal: 20,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 18,
    paddingVertical: 4,
  },
});