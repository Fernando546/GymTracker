import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

type WorkoutData = {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
  userId: string;
};

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const accentColor = '#7C4DFF';
  const darkBackground = '#080808';

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (data) setWorkouts(data as WorkoutData[]);
    };

    fetchWorkouts();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId(prev => (prev === id ? null : id));
  };

  const renderWorkout = ({ item }: { item: WorkoutData }) => {
    const isExpanded = expandedWorkoutId === item.id;
    return (
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <Card style={styles.card}>
          <LinearGradient
            colors={['#121212', '#1a1a1a']}
            style={styles.cardContent}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="barbell" size={20} color={accentColor} />
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleDateString()} •{' '}
                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#666" 
              />
            </View>

            <Text style={styles.summaryText}>
              {item.exercises.map(ex => ex.name).join(', ') || 'No exercises'}
            </Text>

            {isExpanded && (
              <View style={styles.detailsContainer}>
                {item.exercises.map((ex) => (
                  <View key={ex.id} style={styles.exerciseItem}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>
                        {ex.name} 
                        <Text style={styles.exerciseType}> • {ex.type}</Text>
                      </Text>
                      <Ionicons 
                        name={ex.type === 'cardio' ? 'speedometer' : 'fitness'} 
                        size={16} 
                        color="#666" 
                      />
                    </View>
                    
                    {ex.type === 'cardio' ? (
                      <View style={styles.metricContainer}>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Time</Text>
                          <Text style={styles.metricValue}>{ex.time ?? '0'} min</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Distance</Text>
                          <Text style={styles.metricValue}>{ex.distance ?? '0'} km</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.metricContainer}>
                        {ex.type !== 'bodyweight' && (
                          <>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Weight</Text>
                              <Text style={styles.metricValue}>{ex.weight ?? '0'} kg</Text>
                            </View>
                            <View style={styles.separator} />
                          </>
                        )}
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Reps</Text>
                          <Text style={styles.metricValue}>{ex.reps ?? '0'}</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Sets</Text>
                          <Text style={styles.metricValue}>{ex.sets ?? '0'}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[darkBackground, '#101010', '#181818']}
      style={styles.container}
    >
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkout}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={48} color="#444" />
            <Text style={styles.emptyText}>No workouts recorded yet</Text>
          </View>
        }
      />

      <Button
        mode="contained"
        icon="plus"
        onPress={() => router.push('/(app)/workout/new' as any)}
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
        contentStyle={styles.addButtonContent}
      >
        New Workout
      </Button>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateText: {
    color: '#888',
    fontSize: 14,
    flex: 1,
  },
  summaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  exerciseItem: {
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseType: {
    color: '#666',
    fontWeight: '400',
  },
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff08',
    borderRadius: 8,
    padding: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    gap: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    backgroundColor: '#7C4DFF',
    elevation: 4,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonContent: {
    height: 56,
  },
});