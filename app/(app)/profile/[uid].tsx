import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Text, useTheme, Button, Avatar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function UserProfileScreen() {
  const theme = useTheme();
  const { uid } = useLocalSearchParams<{ uid: string }>(); // get uid from route
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) return;
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.containerCentered}>
        <Text>{error || 'Error loading profile'}</Text>
      </View>
    );
  }

  const { username, profile } = userData;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.imageUrl ? (
            <Image 
              source={{ uri: profile.imageUrl }}  
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text 
              size={120}
              label={username?.substring(0, 2).toUpperCase() ?? '??'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}
        </View>

        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: theme.colors.onBackground }]}>
            {profile?.name || 'No Name'}
          </Text>
          <Text style={[styles.usernameTag, { color: theme.colors.onBackground }]}>
            @{username}
          </Text>
        </View>

        <Text style={[styles.bio, { color: theme.colors.onBackground }]}>
          {profile?.bio || 'No bio provided'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.followers ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Followers
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.following ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Following
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.achievements ?? 0}
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
            onPress={() => {
              // You can add follow functionality here.
              alert("Follow button pressed");
            }}
          >
            Follow
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  followButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  followButton: {
    width: '50%',
  },
}); 