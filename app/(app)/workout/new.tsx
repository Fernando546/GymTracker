import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, BackHandler } from 'react-native';
import { Text, useTheme, Button, Card, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '@/components/CustomAlert';
import supabase from '../../config/supabase';

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

    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showAlert("Not Authenticated", "Please sign in to save workouts", [
          { text: "OK", onPress: () => setAlertVisible(false) }
        ]);
        return;
      }

      // Transform exercises data for Supabase
      const formattedExercises = exercises.map(ex => ({
        name: ex.name,
        type: ex.type,
        weight: ex.weight ? parseFloat(ex.weight) : null,
        reps: ex.reps ? parseInt(ex.reps) : null,
        sets: ex.sets ? parseInt(ex.sets) : null,
        time: ex.time ? parseFloat(ex.time) : null,
        distance: ex.distance ? parseFloat(ex.distance) : null
      }));

      const timeZoneOffset = new Date().getTimezoneOffset() * 60000;
      const localISOTime = new Date(Date.now() - timeZoneOffset).toISOString();

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          exercises: formattedExercises,
          date: localISOTime
        })
        .select();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log("Successfully created workout:", data);
      router.push({
        pathname: '/(app)/workout',
        params: { refresh: Date.now() }
      });
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
              <LinearGradient
                colors={['#7C4DFF', '#651FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardHeader}
              >
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Ionicons 
                  name="barbell" 
                  size={20} 
                  color="#ffffff40" 
                  style={styles.exerciseIcon}
                />
              </LinearGradient>
              {ex.type === 'cardio' ? (
                <View style={styles.row}>
                  <TextInput 
                    style={styles.input}
                    placeholder="Time (min)"
                    placeholderTextColor="#666"
                    value={ex.time}
                    onChangeText={(text) =>
                      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, time: text } : e))
                    }
                  />
                  <TextInput 
                    style={styles.input}
                    placeholder="Distance (km)"
                    placeholderTextColor="#666"
                    value={ex.distance}
                    onChangeText={(text) =>
                      setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, distance: text } : e))
                    }
                  />
                </View>
              ) : (
                <View style={styles.row}>
                  {ex.type !== 'bodyweight' && (
                    <View style={styles.inputContainer}>
                      <Ionicons name="speedometer" size={16} color="#7C4DFF" style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input}
                        placeholder="Kg"
                        placeholderTextColor="#666"
                        value={ex.weight}
                        onChangeText={(text) =>
                          setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, weight: text } : e))
                        }
                      />
                    </View>
                  )}
                  <View style={styles.inputContainer}>
                    <Ionicons name="repeat" size={16} color="#7C4DFF" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Reps"
                      placeholderTextColor="#666"
                      value={ex.reps}
                      onChangeText={(text) =>
                        setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, reps: text } : e))
                      }
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Ionicons name="list" size={16} color="#7C4DFF" style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      placeholder="Sets"
                      placeholderTextColor="#666"
                      value={ex.sets}
                      onChangeText={(text) =>
                        setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, sets: text } : e))
                      }
                    />
                  </View>
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
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    padding: 12,
    borderRadius: 8,
    margin: -16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exerciseIcon: {
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    width: '30%',
    textAlign: 'center',
    color: '#fff',
    flex: 1,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: 8,
    opacity: 0.8,
  },
}); 