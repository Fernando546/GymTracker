import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Button, Card, IconButton } from 'react-native-paper';
import { router } from 'expo-router';

export default function NewWorkoutScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton 
          icon="close" 
          size={24} 
          onPress={() => router.back()}
          iconColor={theme.colors.onBackground}
        />
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          New Workout
        </Text>
        <IconButton 
          icon="check" 
          size={24} 
          onPress={() => {
            // Save workout logic here
            router.back();
          }}
          iconColor={theme.colors.primary}
        />
      </View>

      <ScrollView style={styles.content}>
        <Button 
          mode="contained"
          onPress={() => {/* Add exercise logic */}}
          style={styles.addButton}
          icon="plus"
        >
          Add Exercise
        </Button>

        <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
          No exercises added yet
        </Text>
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
}); 