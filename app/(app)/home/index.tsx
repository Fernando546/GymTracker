import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Animated } from 'react-native';
import { Card, Text, useTheme, Button } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Helper function to calculate the current streak from an array of workouts.
function calculateStreak(workouts: { date: string }[]): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const datesSet = new Set<number>();

  // Convert workout dates to timestamps and add to set
  workouts.forEach(w => {
    const d = new Date(w.date);
    d.setHours(0, 0, 0, 0);
    datesSet.add(d.getTime());
  });

  if (datesSet.size === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  let streak = 0;
  let currentCheckDate = todayMs;

  // If no workout today, check from yesterday
  if (!datesSet.has(todayMs)) {
    currentCheckDate = todayMs - dayMs;
  }

  // Count consecutive days with workouts
  while (datesSet.has(currentCheckDate)) {
    streak++;
    currentCheckDate -= dayMs;
  }

  return streak;
}

// Helper function to calculate the longest streak from an array of workouts.
function calculateLongestStreak(workouts: { date: string }[]): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const dates = workouts.map(w => {
    const d = new Date(w.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => a - b);
  if (uniqueDates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i] - uniqueDates[i - 1] === dayMs) {
      current++;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
  }
  return longest;
}

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [workouts, setWorkouts] = useState<{ date: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const accentColor = '#7C4DFF';
  const darkBackground = '#080808';

  // Real-time streak listener
  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'streaks', 'current'), (doc) => {
      if (doc.exists()) {
        setCurrentStreak(doc.data().count);
      }
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'streaks', 'longest'), (doc) => {
      if (doc.exists()) {
        setLongestStreak(doc.data().count);
      }
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!auth.currentUser) return;
      try {
        const workoutsRef = collection(db, "users", auth.currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedWorkouts: { date: string }[] = [];
        querySnapshot.forEach(doc => {
          fetchedWorkouts.push({ date: doc.data().date } as { date: string });
        });
        setWorkouts(fetchedWorkouts);

        const calculatedStreak = calculateStreak(fetchedWorkouts);
        setCurrentStreak(calculatedStreak);

        const computedLongestStreak = calculateLongestStreak(fetchedWorkouts);
        setLongestStreak(computedLongestStreak);

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const storedLongest = userDocSnap.exists() ? userDocSnap.data()?.longestStreak || 0 : 0;
        if (computedLongestStreak > storedLongest) {
          await updateDoc(userDocRef, { longestStreak: computedLongestStreak });
        }
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, [auth.currentUser]);

  return (
    <LinearGradient
      colors={[darkBackground, '#101010', '#181818']}
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
            <Ionicons name="flame" size={28} color={accentColor} />
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
            <Ionicons name="barbell" size={28} color={accentColor} />
            <Text style={styles.cardTitle}>Weight Progress</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>70 kg</Text>
              <Text style={styles.progressLabel}>Current</Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '70%' }]}>
                <LinearGradient
                  colors={['#7C4DFF', '#651FFF']}
                  style={styles.progressFill}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                />
              </View>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>65 kg</Text>
              <Text style={styles.progressLabel}>Target</Text>
            </View>
          </View>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={28} color={accentColor} />
            <Text style={styles.cardTitle}>Recent Activity</Text>
          </View>
          
          <View style={styles.activityContainer}>
            {workouts.slice(0, 3).map((workout, index) => (
              <View key={index} style={styles.activityItem}>
                <Ionicons name="checkmark-circle" size={20} color="#7C4DFF" />
                <Text style={styles.activityText}>
                  Workout on {new Date(workout.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
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