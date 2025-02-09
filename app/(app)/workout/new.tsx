import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, BackHandler, Alert } from 'react-native';
import { Text, useTheme, Button, Card, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';

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

export default function NewWorkoutScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    selectedExercises?: string;
  }>();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  // Add date to workout
  const handleSaveWorkout = () => {
    const workoutData = {
      exercises,
      date: new Date().toLocaleString(),
    };
    console.log('Workout saved:', workoutData);
    router.replace('/(app)/workout');
  };

  // Confirm exit dialog
  const confirmExit = () => {
    Alert.alert(
      'Discard Workout?',
      'Are you sure you want to exit without saving?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', onPress: () => router.replace('/(app)/workout') },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        confirmExit();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    const handleExercises = () => {
      try {
        if (params.selectedExercises && params.selectedExercises.startsWith('[')) {
          const parsedExercises = JSON.parse(params.selectedExercises);
          
          setExercises(prev => {
            const newExercises = parsedExercises.filter((newEx: WorkoutExercise) => 
              !prev.some(ex => ex.id === newEx.id)
            );
            return [...prev, ...newExercises];
          });

          router.setParams({ selectedExercises: '' });
        }
      } catch (error) {
        console.error('Error parsing exercises:', error);
      }
    };
  
    handleExercises();
  }, [params.selectedExercises]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
     <View style={styles.header}>
        <IconButton 
          icon="close" 
          size={24} 
          onPress={confirmExit}
          iconColor={theme.colors.onBackground}
        />
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          New Workout
        </Text>
        <IconButton 
          icon="check" 
          size={24} 
          onPress={handleSaveWorkout}
          iconColor={theme.colors.primary}
        />
      </View>

      <ScrollView style={styles.content}>
        {exercises.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
            No exercises added yet
          </Text>
        ) : (
          exercises.map(ex => (
            <Card key={ex.id} style={styles.exerciseCard}>
              <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>{ex.name}</Text>
              {ex.type === 'cardio' ? (
                <View style={styles.row}>
                  <TextInput 
                    style={styles.input}
                    placeholder="Time (min)"
                    value={ex.time}
                    onChangeText={(text) =>
                      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, time: text } : e))
                    }
                  />
                  <TextInput 
                    style={styles.input}
                    placeholder="Distance (km)"
                    value={ex.distance}
                    onChangeText={(text) =>
                      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, distance: text } : e))
                    }
                  />
                </View>
              ) : (
                <View style={styles.row}>
                  {ex.type !== 'bodyweight' && (
                    <TextInput 
                      style={styles.input}
                      placeholder="Weight (kg)"
                      value={ex.weight}
                      onChangeText={(text) =>
                        setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, weight: text } : e))
                      }
                    />
                  )}
                  <TextInput 
                    style={styles.input}
                    placeholder="Reps"
                    value={ex.reps}
                    onChangeText={(text) =>
                      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, reps: text } : e))
                    }
                  />
                  <TextInput 
                    style={styles.input}
                    placeholder="Sets"
                    value={ex.sets}
                    onChangeText={(text) =>
                      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, sets: text } : e))
                    }
                  />
                </View>
              )}
            </Card>
          ))
        )}
        <Button 
          mode="contained"
          onPress={() => router.push({
            pathname: '/(app)/workout/exerciseSearch',
            params: { currentExercises: JSON.stringify(exercises) }
          })}
          style={styles.addButton}
          icon="plus"
        >
          Add Exercise
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  exerciseCard: {
    marginVertical: 8,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 4,
    width: '30%',
    textAlign: 'center',
  },
}); 