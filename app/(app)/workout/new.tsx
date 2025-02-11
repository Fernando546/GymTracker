import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, BackHandler } from 'react-native';
import { Text, useTheme, Button, Card, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '@/components/CustomAlert';

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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{ text: string; onPress: () => void }>,
  });

  const showAlert = (
    title: string,
    message: string,
    buttons: Array<{ text: string; onPress: () => void }>
  ) => {
    setAlertContent({ title, message, buttons });
    setAlertVisible(true);
  };

  // Save workout to Firestore
  const handleSaveWorkout = async () => {
    if (exercises.length === 0) {
      showAlert("No exercises", "Please add at least one exercise.", [
        { text: "OK", onPress: () => setAlertVisible(false) }
      ]);
      return;
    }

    const auth = getAuth();
    const workoutData = {
      exercises,
      date: new Date().toISOString(),
      userId: auth.currentUser?.uid, // Actual user uid from Firebase Auth
    };

    try {
      await addDoc(
        collection(db, "users", auth.currentUser?.uid as string, "workouts"),
        workoutData
      );
      console.log("Workout saved:", workoutData);
      router.replace('/(app)/workout');
    } catch (err) {
      console.error("Error saving workout", err);
      showAlert("Error", "Failed to save workout", [
        { text: "OK", onPress: () => setAlertVisible(false) }
      ]);
    }
  };

  // Confirm exit dialog
  const confirmExit = () => {
    showAlert(
      'Discard Workout?',
      'Are you sure you want to exit without saving?',
      [
        { 
          text: 'Cancel', 
          onPress: () => setAlertVisible(false) 
        },
        { 
          text: 'Discard', 
          onPress: () => {
            setAlertVisible(false);
            router.replace('/(app)/workout');
          }
        },
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
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="close" 
          size={24} 
          onPress={confirmExit}
          iconColor="#7C4DFF"
        />
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          New Workout
        </Text>
        <IconButton 
          icon="check" 
          size={24} 
          onPress={handleSaveWorkout}
          iconColor="#7C4DFF"
        />
      </View>

      <ScrollView style={styles.content}>
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell" size={48} color="#7C4DFF" style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
              No exercises added yet
            </Text>
          </View>
        ) : (
          exercises.map(ex => (
            <Card key={ex.id} style={[styles.exerciseCard, { backgroundColor: '#121212' }]}>
              <Text style={{ marginBottom: 4, fontWeight: 'bold', color: '#fff' }}>
                {ex.name}
              </Text>
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
          textColor="#fff"
          icon="plus"
        >
          Add Exercise
        </Button>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertContent.title}
        message={alertContent.message}
        onDismiss={() => setAlertVisible(false)}
        buttons={alertContent.buttons}
      />
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#7C4DFF',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  exerciseCard: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    width: '30%',
    textAlign: 'center',
    color: '#fff',
  },
}); 