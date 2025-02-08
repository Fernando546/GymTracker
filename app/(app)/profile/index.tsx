import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme, Button, Card, Avatar, IconButton } from 'react-native-paper';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const theme = useTheme();

  // Placeholder data - replace with real data later
  const profile = {
    name: "John Doe",
    bio: "Fitness enthusiast | Working on becoming stronger every day",
    followers: 128,
    following: 145,
    achievements: 12,
    imageUrl: null // placeholder for profile image
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => {/* Add image picker logic */}}
        >
          {profile.imageUrl ? (
            <Image 
              source={{ uri: profile.imageUrl }} 
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon 
              size={120} 
              icon="account"
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
          <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
            <IconButton 
              icon="camera" 
              size={20}
              iconColor={theme.colors.onPrimary}
            />
          </View>
        </TouchableOpacity>

        <Text style={[styles.name, { color: theme.colors.onBackground }]}>
          {profile.name}
        </Text>
        <Text style={[styles.bio, { color: theme.colors.onBackground }]}>
          {profile.bio}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile.followers}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Followers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile.following}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Following
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile.achievements}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Achievements
            </Text>
          </View>
        </View>
      </View>

      <Card style={[styles.section, { backgroundColor: theme.colors.elevation.level2 }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Recent Achievements
          </Text>
          {/* Add achievements list here */}
          <Text style={{ color: theme.colors.onBackground }}>
            🏆 30 Day Streak
          </Text>
          <Text style={{ color: theme.colors.onBackground }}>
            💪 100 Workouts Completed
          </Text>
        </Card.Content>
      </Card>

      <Button 
        mode="outlined"
        onPress={() => {/* Add edit profile logic */}}
        style={styles.editButton}
      >
        Edit Profile
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  editButton: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
}); 