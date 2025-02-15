import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import supabase from '../../config/supabase';


export default function HomeScreen() {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [startWeight, setStartWeight] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Add theme access from react-native-paper
  const theme = useTheme();

  // Add useLocalSearchParams
  const params = useLocalSearchParams();

  // Update the useEffect for streaks
  useEffect(() => {
    const fetchStreaks = async () => {
      if (!user?.id) return;

      try {
        const { data: streakData, error } = await supabase.rpc('get_current_streak', {
          user_id: user.id
        });
        
        const { data: longestData, error: longestError } = await supabase.rpc('get_longest_streak', {
          user_id: user.id
        });

        console.log('Streak calculation results:', {
          currentStreak: streakData,
          longestStreak: longestData,
          workoutDates: await supabase
            .from('workouts')
            .select('date')
            .eq('user_id', user.id)
            .then(({ data }) => data?.map(d => 
              new Date(d.date).toLocaleDateString('en-US', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              })
            ))
        });

        if (!error && !longestError) {
          const currentStreakValue = streakData === null ? 0 : streakData;
          const longestStreakValue = longestData === null ? 0 : longestData;

          setCurrentStreak(currentStreakValue);
          setLongestStreak(longestStreakValue);
          
          // Update user's longest streak if needed
          const { data: userData } = await supabase
            .from('users')
            .select('longest_streak')
            .eq('id', user.id)
            .single();

          if (longestStreakValue > (userData?.longest_streak || 0)) {
            await supabase
              .from('users')
              .update({ longest_streak: longestStreakValue })
              .eq('id', user.id);
          }
        }
      } catch (error) {
        console.error("Error fetching streaks:", error);
      }
    };

    fetchStreaks();
  }, [user?.id, refreshKey]);

  // Update weight progress useEffect
  useFocusEffect(
    useCallback(() => {
      const fetchWeightData = async () => {
        if (!user?.id) return;
        
        try {
          // Get weight goals
          const { data: goalsData } = await supabase
            .from('weight_goals')
            .select('current, target')
            .eq('user_id', user.id)
            .single();

          if (goalsData) {
            setStartWeight(goalsData.current);
            setTargetWeight(goalsData.target.toString());
          }

          // Get latest weight entry
          const { data: weightData } = await supabase
            .from('weight_entries')
            .select('weight')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(1);

          if (weightData?.[0]?.weight) {
            setCurrentWeight(weightData[0].weight.toString());
          }
        } catch (error) {
          console.error("Error fetching weight data:", error);
        }
      };

      fetchWeightData();
    }, [user?.id])
  );

  useEffect(() => {
    if (startWeight > 0 && targetWeight && currentWeight) {
      const start = startWeight;
      const target = parseFloat(targetWeight);
      const current = parseFloat(currentWeight);
      
      const totalChange = Math.abs(start - target);
      const progress = Math.abs(start - current);
      const percentage = Math.min(Math.max((progress / totalChange) * 100, 0), 100);
      
      setProgressPercentage(percentage);
    }
  }, [startWeight, currentWeight, targetWeight]);

  // Add useEffect to watch for refresh
  useEffect(() => {
    if (params.refresh) {
      refreshData();
    }
  }, [params.refresh]);

  const refreshData = () => setRefreshKey(prev => prev + 1);

  return (
    <LinearGradient
      colors={[theme.colors.background, '#101010', '#181818']}
      style={styles.container}
    >
      {/* Decorative Elements */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Streak Section */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={28} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Workout Streaks</Text>
          </View>
          
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Ionicons 
                name="calendar" 
                size={24} 
                color="#666" 
                style={styles.streakIcon}
              />
            </View>
            
            <View style={styles.separator} />
            
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{longestStreak}</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
              <Ionicons 
                name="trophy" 
                size={24} 
                color="#666" 
                style={styles.streakIcon}
              />
            </View>
          </View>
        </Card>

        {/* Progress Section */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="barbell" size={28} color={theme.colors.primary} />
            <TouchableOpacity onPress={() => router.push('/home/weightProgress')}>
              <Text style={styles.cardTitle}>Weight Progress</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>
                {currentWeight || '--'} kg
              </Text>
              <Text style={styles.progressLabel}>Current</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progressPercentage}%` }]}>
                <LinearGradient
                  colors={['#7C4DFF', '#651FFF']}
                  style={styles.progressFill}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                />
              </View>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>
                {targetWeight || '--'} kg
              </Text>
              <Text style={styles.progressLabel}>Target</Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={28} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Recent Activity</Text>
          </View>
          
          <View style={styles.activityContainer}>
            {/* workouts.slice(0, 3).map((workout, index) => (
              <View key={index} style={styles.activityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#7C4DFF" />
                <Text style={styles.activityText}>
                  Workout on {new Date(workout.date).toLocaleDateString()}
                </Text>
              </View>
            )) */}
          </View>
        </Card>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  streakNumber: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  streakLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  streakIcon: {
    position: 'absolute',
    top: -8,
    right: 8,
    opacity: 0.3,
  },
  separator: {
    width: 1,
    height: 60,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  progressLabel: {
    color: '#888',
    fontSize: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressFill: {
    flex: 1,
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  activityText: {
    color: '#fff',
    fontSize: 14,
  },
  circle: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: '#7C4DFF10',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -150,
    left: -150,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -100,
    right: -100,
  },
});