import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();
  
  const streakData = {
    currentStreak: 5,
    longestStreak: 10,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Streak Display Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Current Streak</Text>
          <View style={styles.streakContainer}>
            <Text style={[styles.streakNumber, { color: theme.colors.primary }]}>
              {streakData.currentStreak}
            </Text>
            <Text style={{ color: theme.colors.onSurface }}>days</Text>
          </View>
          <Text style={{ color: theme.colors.onSurface }}>
            Longest streak: {streakData.longestStreak} days
          </Text>
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