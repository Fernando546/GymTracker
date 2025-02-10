import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

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
  const [workouts, setWorkouts] = useState<{ date: string }[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const auth = getAuth();
  
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
        setStreak(calculatedStreak);

        const computedLongestStreak = calculateLongestStreak(fetchedWorkouts);
        setLongestStreak(computedLongestStreak);

        // Update longest streak in the user's document if needed.
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Streak Display Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Current Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={[styles.streakNumber, { color: theme.colors.primary }]}>
              {streak}
            </Text>
            <Text style={{ color: theme.colors.onSurface }}>day current streak</Text>
          </View>
          <View style={styles.streakContainer}>
            <Text style={[styles.streakNumber, { color: theme.colors.primary }]}>
              {longestStreak}
            </Text>
            <Text style={{ color: theme.colors.onSurface }}>day longest streak</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Weight Progress Preview */}
      <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Weight Progress</Text>
          <Text style={{ color: theme.colors.onSurface }}>Current Weight: 70 kg</Text>
          <Text style={{ color: theme.colors.onSurface }}>Target Weight: 65 kg</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  streakContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
}); 