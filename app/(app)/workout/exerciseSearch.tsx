import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { TextInput, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.back();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

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
        refreshKey: Date.now().toString()
      },
    });
  };

  return (
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={() => <Ionicons name="arrow-back" size={24} color="#7C4DFF" />}
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Search Exercises</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7C4DFF" style={styles.searchIcon} />
        <TextInput
          placeholder="Search exercises..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          outlineColor="transparent"
          textColor="#fff"
        />
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)}>
            <View style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>
                {item.name} ({item.type})
              </Text>
              <Ionicons name="add-circle" size={24} color="#7C4DFF" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={60} color="#7C4DFF" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No exercises found</Text>
          </View>
        }
      />

      <Button 
        mode="contained" 
        onPress={() => router.replace('/(app)/workout/new')}
        style={styles.backButton}
        buttonColor="#7C4DFF"
        textColor="#fff"
      >
        Cancel
      </Button>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    borderRadius: 8,
  },
}); 