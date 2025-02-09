import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Card } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { router } from 'expo-router';

type WorkoutExercise = {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'bodyweight';
  weight?: string;
  reps?: string;
  sets?: string;
  time?: string;
  distance?: string;
};

type WorkoutData = {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
  userId: string;
};

export default function WorkoutScreen() {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!auth.currentUser) return;
      try {
        const workoutsRef = collection(db, "users", auth.currentUser.uid, "workouts");
        // Order workouts by date descending
        const q = query(workoutsRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedWorkouts: WorkoutData[] = [];
        querySnapshot.forEach(doc => {
          // Combine document ID with fetched data
          fetchedWorkouts.push({ id: doc.id, ...doc.data() } as WorkoutData);
        });
        setWorkouts(fetchedWorkouts);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, [auth.currentUser]);

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId(prev => (prev === id ? null : id));
  };

  const renderWorkout = ({ item }: { item: WorkoutData }) => {
    const isExpanded = expandedWorkoutId === item.id;
    return (
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.dateText}>
              {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.summaryText}>
              {item.exercises.map(ex => ex.name).join(', ') || 'No exercises'}
            </Text>
            {isExpanded && (
              <View style={styles.detailsContainer}>
                {item.exercises.map((ex) => (
                  <View key={ex.id} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>
                      {ex.name} ({ex.type})
                    </Text>
                    {ex.type === 'cardio' ? (
                      <Text style={styles.exerciseDetails}>
                        Time: {ex.time ?? '-'} min, Distance: {ex.distance ?? '-'} km
                      </Text>
                    ) : (
                      <>
                        {ex.type !== 'bodyweight' && (
                          <Text style={styles.exerciseDetails}>
                            Weight: {ex.weight ?? '-'} kg
                          </Text>
                        )}
                        <Text style={styles.exerciseDetails}>
                          Reps: {ex.reps ?? '-'}, Sets: {ex.sets ?? '-'}
                        </Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkout}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: theme.colors.onBackground }}>
            No workouts found.
          </Text>
        }
        ListFooterComponent={
          <Button
            mode="contained"
            icon="plus"
            onPress={() => router.push('/(app)/workout/new' as any)}
            style={styles.addButton}
          >
            Add Workout
          </Button>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 12 },
  dateText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  summaryText: { fontSize: 14, marginBottom: 8 },
  detailsContainer: { marginTop: 8 },
  exerciseItem: { marginTop: 4 },
  exerciseName: { fontSize: 14, fontWeight: 'bold' },
  exerciseDetails: { fontSize: 12, color: 'gray' },
  addButton: { marginVertical: 20, alignSelf: 'center' },
}); 