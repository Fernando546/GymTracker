import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, useTheme, Button, Card, Avatar, IconButton, TextInput as PaperTextInput, Button as PaperButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { pickImage, uploadProfileImage, updateUserProfile } from '../../services/user';

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, loading, error, refetch } = useUserProfile();
  const { signOut, user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.profile?.name || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(profile?.profile?.bio || '');

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

  const handleUpdateName = async () => {
    try {
      if (!user) return;
      setIsEditingName(false);
      await updateUserProfile(user.uid, {
        ...profile?.profile,
        name: newName.trim()
      });
      await refetch();
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name');
    }
  };

  const handleUpdateBio = async () => {
    try {
      if (!user) return;
      setIsEditingBio(false);
      await updateUserProfile(user.uid, {
        ...profile?.profile,
        bio: newBio.trim()
      });
      await refetch();
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio');
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

        <View style={styles.nameContainer}>
          <View style={styles.editableField}>
            {isEditingName ? (
              <PaperTextInput
                value={newName}
                onChangeText={setNewName}
                style={[styles.nameInput, { backgroundColor: 'transparent' }]}
                onBlur={handleUpdateName}
                autoFocus
              />
            ) : (
              <View style={[styles.editableField, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                <IconButton icon="pencil" size={16} style={{ opacity: 0 }} />

                <TouchableOpacity 
                  onPress={() => {
                    setNewName(profile?.profile?.name || '');
                    setIsEditingName(true);
                  }}
                >
                  <Text style={[styles.name, { color: theme.colors.onBackground, textAlign: 'center' }]}>
                    {profile?.profile?.name || 'Add name'}
                  </Text>
                </TouchableOpacity>

                <IconButton 
                  icon="pencil" 
                  size={16}
                  onPress={() => {
                    setNewName(profile?.profile?.name || '');
                    setIsEditingName(true);
                  }}
                  style={{ marginLeft: 4 }}
                />
              </View>
            )}
          </View>
          <Text style={[styles.usernameTag, { color: theme.colors.onBackground }]}>
            @{profile?.username}
          </Text>
        </View>
        <View style={styles.editableField}>
          {isEditingBio ? (
            <>
              <PaperTextInput
                value={newBio}
                onChangeText={setNewBio}
                style={[styles.bioInput, { backgroundColor: 'transparent' }]}
                onBlur={handleUpdateBio}
                autoFocus
                multiline
              />
              <PaperButton onPress={handleUpdateBio} mode="contained" style={styles.doneButton}>
                Done
              </PaperButton>
            </>
          ) : (
            <View style={[styles.editableField, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
              <IconButton icon="pencil" size={16} style={{ opacity: 0 }} />

              <TouchableOpacity 
                onPress={() => {
                  setNewBio(profile?.profile?.bio || '');
                  setIsEditingBio(true);
                }}
              >
                <Text style={[styles.bio, { color: theme.colors.onBackground, textAlign: 'center' }]}>
                  {profile?.profile?.bio || 'Add bio'}
                </Text>
              </TouchableOpacity>

              <IconButton 
                icon="pencil" 
                size={16}
                onPress={() => {
                  setNewBio(profile?.profile?.bio || '');
                  setIsEditingBio(true);
                }}
                style={{ marginLeft: 4, transform: [{ translateY: -2 }] }} 
              />
            </View>
          )}
        </View>

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
        <View style={styles.followButtonContainer}>
          <Button
            mode="contained"
            style={styles.followButton}
            onPress={() => router.push('/(app)/profile/_search')}
          >
            Find User
          </Button>
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
  nameContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  usernameTag: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
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
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    width: '80%',
  },
  editableField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioInput: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    width: '80%',
  },
  doneButton: {
    marginLeft: 8,
  },
  followButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  followButton: {
    width: '50%',
  },
}); 