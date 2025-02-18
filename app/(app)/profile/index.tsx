import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, useTheme, Button, Card, Avatar, IconButton, TextInput as PaperTextInput, Button as PaperButton } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { pickImage, uploadProfileImage, updateUserProfile } from '../../services/user';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../config/supabase';

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, loading, error, refetch } = useUserProfile();
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(profile?.bio || '');
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const achievements = [
    { id: '0', name: '1 Day Streak', image: require('@/assets/images/one.png'), achieved: false },
    { id: '1', name: '10 Day Streak', image: require('@/assets/images/one.png'), achieved: false },
    { id: '2', name: '30 Day Streak', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '3', name: '100 Day Streak', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '4', name: '1 Year Streak', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '5', name: '100 Workouts', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '6', name: 'Bench 100!', image: require('@/assets/images/thirty.png'), achieved: true },
    { id: '7', name: '5K Run', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '8', name: 'First Run', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '9', name: '5k Run', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '10', name: '10k Run', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '11', name: 'Half Marathon', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '12', name: 'Marathon', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '13', name: '10 Pull-Ups', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '14', name: '10 Push-Ups', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '15', name: '100 Push-Ups', image: require('@/assets/images/thirty.png'), achieved: false },
    { id: '16', name: '100 Pull-Ups', image: require('@/assets/images/thirty.png'), achieved: false }, 
    { id: '17', name: 'First Swim', image: require('@/assets/images/thirty.png'), achieved: false },  
  ];

  const sortedAchievements = [...achievements].sort((a, b) =>
    a.achieved === b.achieved ? 0 : a.achieved ? -1 : 1
  );
  const achievementsToShow = showAllAchievements ? sortedAchievements : sortedAchievements.slice(0, 3);

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
        await uploadProfileImage(user.id, imageUri);
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
      await updateUserProfile(user.id, { name: newName.trim() });
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
      await updateUserProfile(user.id, { bio: newBio.trim() });
      await refetch();
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update bio');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      async function fetchCounts() {
        if (!user?.id) return;
        
        const { count: followers } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id);

        const { count: following } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id);

        setFollowersCount(followers || 0);
        setFollowingCount(following || 0);
      }
      fetchCounts();
    }, [user])
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: theme.colors.onBackground }}>
          Loading Profile...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error?.message || 'Unknown error'}</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      {/* Decorative elements */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handleImagePick}
                disabled={isUploading}
              >
                {profile?.image_url ? (
                  <Image 
                    source={{ uri: profile.image_url }} 
                    style={styles.avatar}
                  />
                ) : (
                  <Avatar.Text 
                    size={120}
                    label={profile?.name?.substring(0, 2).toUpperCase() ?? '??'}
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
                        setNewName(profile?.name || '');
                        setIsEditingName(true);
                      }}
                    >
                      <Text style={[styles.name, { color: theme.colors.onBackground, textAlign: 'center' }]}>
                        {profile?.name || 'Add name'}
                      </Text>
                    </TouchableOpacity>

                    <IconButton 
                      icon="pencil" 
                      size={16}
                      onPress={() => {
                        setNewName(profile?.name || '');
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
                      setNewBio(profile?.bio || '');
                      setIsEditingBio(true);
                    }}
                  >
                    <Text style={[styles.bio, { color: theme.colors.onBackground, textAlign: 'center' }]}>
                      {profile?.bio || 'Add bio'}
                    </Text>
                  </TouchableOpacity>

                  <IconButton 
                    icon="pencil" 
                    size={16}
                    onPress={() => {
                      setNewBio(profile?.bio || '');
                      setIsEditingBio(true);
                    }}
                    style={{ marginLeft: 4, transform: [{ translateY: -2 }] }} 
                  />
                </View>
              )}
            </View>

            <View style={styles.statsContainer}>
              <TouchableOpacity onPress={() => router.push(`/profile/followers?uid=${user?.id}`)}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#7C4DFF' }]}>
                    {followersCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
                    Followers
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push(`/profile/following?uid=${user?.id}`)}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#7C4DFF' }]}>
                    {followingCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.onBackground }]}>
                    Following
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.followButtonContainer}>
              <Button
                mode="contained"
                buttonColor="#7C4DFF"
                textColor="#fff"
                style={styles.followButton}
                onPress={() => router.push('/(app)/profile/_search')}
              >
                Find User
              </Button>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            <Ionicons name="trophy" size={20} color="#7C4DFF" style={styles.icon} />
            {'  '}Achievements
          </Text>
          <View style={styles.achievementsGrid}>
            {achievementsToShow.map(item => (
              <View key={item.id} style={styles.achievementItem}>
                <Image
                  source={typeof item.image === 'number' ? item.image : { uri: item.image }}
                  style={[
                    styles.achievementImage,
                    !item.achieved && styles.unachievedImage
                  ]}
                />
                <Text
                  style={[
                    styles.achievementName,
                    { color: theme.colors.onBackground },
                    !item.achieved && { opacity: 0.5 }
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
          {achievements.length > 3 && (
            <Button mode="text" textColor="#7C4DFF" onPress={() => setShowAllAchievements(!showAllAchievements)}>
              {showAllAchievements ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </Card>

        <Button 
          mode="outlined"
          textColor="#7C4DFF"
          onPress={signOut}
          style={styles.editButton}
        >
          Sign Out
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementsContainer: {
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  achievementsGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  achievementItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementImage: {
    width: 50,
    height: 50,
  },
  unachievedImage: {
    opacity: 0.5,
  },
  achievementName: {
    marginTop: 4,
    fontSize: 12,
  },
  card: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  scrollContainer: {
    paddingBottom: 40,
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
  icon: {
    marginRight: 8,
  },
}); 