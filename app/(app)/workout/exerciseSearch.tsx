import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, Button, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Exercise = {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'bodyweight';
};

const exercisesData: Exercise[] = [
  { id: '1', name: 'Bench Press', type: 'strength' },
  { id: '2', name: 'Squat', type: 'strength' },
  { id: '3', name: 'Deadlift', type: 'strength' },
  { id: '4', name: 'Running', type: 'cardio' },
  { id: '5', name: 'Cycling', type: 'cardio' },
  { id: '6', name: 'Push-ups', type: 'bodyweight' },
];

export default function ExerciseSearch() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ currentExercises?: string }>();
  const [searchText, setSearchText] = useState('');
  
  const currentExercises = params.currentExercises 
    ? JSON.parse(params.currentExercises) 
    : [];

  const filteredExercises = exercisesData.filter(exercise =>
    exercise.name.toLowerCase().includes(searchText.toLowerCase()) &&
    !currentExercises.some((ex: Exercise) => ex.id === exercise.id)
  );

  const handleSelect = (exercise: Exercise) => {
    const updatedExercises = [...currentExercises, exercise];
    router.navigate({
      pathname: '/(app)/workout/new',
      params: { 
        selectedExercises: JSON.stringify(updatedExercises),
        // Add cache busting parameter
        refreshKey: Date.now().toString()
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput

        style={styles.searchInput}
        placeholder="Search exercises..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <View style={styles.itemContainer}>
              <Text style={{ color: theme.colors.onBackground, fontSize: 16 }}>
                {item.name} ({item.type})
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises found.</Text>
        }
      />
      <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
        Cancel
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchInput: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  itemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
}); 