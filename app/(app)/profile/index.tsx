import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, useTheme, Button, Card, Avatar, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { pickImage, uploadProfileImage } from '../../services/user';

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, loading, error, refetch } = useUserProfile();
  const { signOut, user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const imageUri = await pickImage();
      if (imageUri && user) {
        setIsUploading(true);
        await uploadProfileImage(user.uid, imageUri);
        await refetch();
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Failed to update profile image');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleImagePick}
            disabled={isUploading}
          >
            {profile?.profile?.imageUrl ? (
              <Image 
                source={{ uri: profile.profile.imageUrl }} 
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                size={120}
                label={profile?.username?.substring(0, 2).toUpperCase() ?? '??'}
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            {isUploading && (
              <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.name, { color: theme.colors.onBackground }]}>
          {profile?.profile?.name}
        </Text>
        <Text style={[styles.username, { color: theme.colors.onBackground }]}>
          @{profile?.username}
        </Text>
        <Text style={[styles.bio, { color: theme.colors.onBackground }]}>
          {profile?.profile?.bio || 'No bio yet'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.profile?.followers ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Followers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.profile?.following ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Following
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.profile?.achievements ?? 0}
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
        onPress={signOut}
        style={styles.editButton}
      >
        Sign Out
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
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
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