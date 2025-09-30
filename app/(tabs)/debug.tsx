import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useLessonStore } from '@/lib/store/lesson-store';
import { RNPText } from '@/components/ui/RNPText';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DebugScreen() {
  const { dateOverride, setDateOverride, lastActivityDate, currentStreak, streakFreezes } = useLessonStore();
  const [customDate, setCustomDate] = useState(dateOverride || '');

  const handleSetDate = () => {
    // Basic validation for YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(customDate)) {
      setDateOverride(customDate);
      Alert.alert('Date Override Set', `The date is now set to ${customDate}`);
    } else {
      Alert.alert('Invalid Date Format', 'Please use YYYY-MM-DD format.');
    }
  };

  const handleResetDate = () => {
    setDateOverride(null);
    setCustomDate('');
    Alert.alert('Date Override Reset', 'The date is now back to the real date.');
  };

  const handleAdvanceDay = () => {
    const currentDate = dateOverride ? new Date(dateOverride) : new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = currentDate.toISOString().split('T')[0];
    setDateOverride(newDate);
    setCustomDate(newDate);
  };

  const handleAdvanceWeek = () => {
    const currentDate = dateOverride ? new Date(dateOverride) : new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    const newDate = currentDate.toISOString().split('T')[0];
    setDateOverride(newDate);
    setCustomDate(newDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNPText style={styles.title}>Time Travel Debug</RNPText>
      <Card style={styles.card}>
        <Card.Content>
          <RNPText style={styles.currentDateText}>Current Date (Override): {dateOverride || new Date().toISOString().split('T')[0]}</RNPText>
          <TextInput
            label="Custom Date (YYYY-MM-DD)"
            value={customDate}
            onChangeText={setCustomDate}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={handleSetDate} style={styles.button}>Set Date</Button>
            <Button mode="outlined" onPress={handleResetDate} style={styles.button}>Reset Date</Button>
          </View>
          <View style={styles.buttonRow}>
            <Button onPress={handleAdvanceDay}>+1 Day</Button>
            <Button onPress={handleAdvanceWeek}>+1 Week</Button>
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Content>
            <RNPText style={styles.title}>Current Streak Info</RNPText>
            <RNPText>Last Activity Date: {lastActivityDate || 'N/A'}</RNPText>
            <RNPText>Current Streak: {currentStreak}</RNPText>
            <RNPText>Streak Freezes: {streakFreezes}</RNPText>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  currentDateText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});