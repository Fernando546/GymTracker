import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, Avatar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { followUser, unfollowUser } from '../../services/user';

export default function UserProfileScreen() {
  const theme = useTheme();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    async function fetchUserProfile() {
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
    }
    fetchUserProfile();
  }, [uid]);

  // Fetch counts from subcollections every time uid changes.
  useEffect(() => {
    async function fetchCounts() {
      if (!uid) return;
      try {
        const followersSnap = await getCountFromServer(collection(db, 'users', uid, 'followers'));
        setFollowersCount(followersSnap.data().count);

        const followingSnap = await getCountFromServer(collection(db, 'users', uid, 'following'));
        setFollowingCount(followingSnap.data().count);
      } catch (error) {
        console.error("Failed to fetch counts: ", error);
      }
    }
    fetchCounts();
  }, [uid]);

  // Check if current user follows target user.
  useEffect(() => {
    async function checkFollow() {
      if (!user || !uid) return;
      const followRef = doc(db, 'users', uid, 'followers', user.uid);
      const snap = await getDoc(followRef);
      setIsFollowed(snap.exists());
    }
    checkFollow();
  }, [user, uid]);

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
        <Text>{error || "Error loading profile"}</Text>
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
          <TouchableOpacity
            onPress={() => {
              console.log("Pressed Followers: uid =", uid);
              router.push(`/profile/followers?uid=${uid}`);
            }}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {followersCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
                Followers
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log("Pressed Following: uid =", uid);
              router.push(`/profile/following?uid=${uid}`);
            }}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                {followingCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
                Following
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
              {profile?.achievements ?? 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
              Achievements
            </Text>
          </View>
        </View>

        {user?.uid === uid ? (
          <View style={styles.followButtonContainer}>
            <Button
              mode="contained"
              style={styles.followButton}
              onPress={() => {
                alert("Find User button pressed");
              }}
            >
              Find User
            </Button>
          </View>
        ) : (
          <View style={styles.followButtonContainer}>
            <Button
              mode="contained"
              style={styles.followButton}
              onPress={async () => {
                try {
                  if (isFollowed) {
                    // Unfollow the user if already followed.
                    await unfollowUser(user.uid, uid);
                    setIsFollowed(false);
                    setFollowersCount((prev) => Math.max(prev - 1, 0));
                  } else {
                    // Follow the user if not followed.
                    await followUser(user.uid, uid);
                    setIsFollowed(true);
                    setFollowersCount((prev) => prev + 1);
                  }
                } catch (error) {
                  console.error("Failed to update follow status:", error);
                  alert("Failed to update follow status");
                }
              }}
            >
              {isFollowed ? "Followed" : "Follow"}
            </Button>
          </View>
        )}
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