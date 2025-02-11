import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, BackHandler } from 'react-native';
import { Text, useTheme, Button, Avatar, IconButton, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { followUser, unfollowUser } from '../../services/user';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.back();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

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
  const isCurrentUser = user?.uid === uid;

  return (
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon={() => <Ionicons name="arrow-back" size={24} color="#7C4DFF" />}
          onPress={() => router.back()}
        />
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {profile?.name || 'Profile'}
        </Text>
        {isCurrentUser ? (
          <IconButton 
            icon="pencil" 
            size={24} 
            onPress={() => router.push('/profile/edit')}
            iconColor="#7C4DFF"
          />
        ) : (
          <View style={{ width: 24 }} /> // Spacer
        )}
      </View>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
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
              style={{ backgroundColor: '#7C4DFF' }}
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
              <Text style={[styles.statNumber, { color: '#7C4DFF' }]}>
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
              <Text style={[styles.statNumber, { color: '#7C4DFF' }]}>
                {followingCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
                Following
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#7C4DFF' }]}>
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
              buttonColor="#7C4DFF"
              textColor="#fff"
              onPress={async () => {
                try {
                  if (isFollowed) {
                    await unfollowUser(user.uid, uid);
                    setIsFollowed(false);
                    setFollowersCount((prev) => Math.max(prev - 1, 0));
                  } else {
                    await followUser(user.uid, uid);
                    setIsFollowed(true);
                    setFollowersCount((prev) => prev + 1);
                  }
                } catch (error) {
                  console.error("Failed to update follow status:", error);
                  alert("Failed to update follow status");
                }
              }}
              style={styles.followButton}
            >
              {isFollowed ? "Followed" : "Follow"}
            </Button>
          </View>
        )}
      </Card>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#fff',
    lineHeight: 24,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C4DFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  followButtonContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  followButton: {
    width: '50%',
    alignSelf: 'center',
    borderRadius: 8,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}); 