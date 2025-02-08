import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';

export default function WorkoutScreen() {
  const theme = useTheme();

  // Placeholder data - replace with real data later
  const recentWorkouts = [
    {
      id: 1,
      date: '2024-03-20',
      exercises: ['Bench Press', 'Squats', 'Deadlift'],
      duration: '45 min'
    },
    {
      id: 2,
      date: '2024-03-18',
      exercises: ['Pull-ups', 'Rows', 'Bicep Curls'],
      duration: '35 min'
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button 
        mode="contained"
        onPress={() => router.push('/(app)/workout/new' as any)}
        style={styles.startButton}
        icon="plus"
      >
        Start New Workout
      </Button>

      <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Recent Workouts
      </Text>

      {recentWorkouts.map(workout => (
        <Card 
          key={workout.id} 
          style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}
          onPress={() => router.push({
            pathname: '/(app)/workout/details' as any,
            params: { id: workout.id }
          })}
        >
          <Card.Content>
            <Text style={[styles.date, { color: theme.colors.onSurface }]}>
              {new Date(workout.date).toLocaleDateString()}
            </Text>
            <Text style={{ color: theme.colors.onSurface }}>
              {workout.exercises.join(', ')}
            </Text>
            <Text style={[styles.duration, { color: theme.colors.onSurface }]}>
              Duration: {workout.duration}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  startButton: {
    paddingVertical: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  duration: {
    marginTop: 4,
    opacity: 0.7,
  },
}); 