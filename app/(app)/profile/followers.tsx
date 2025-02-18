import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Text, Avatar, List, useTheme, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import supabase from '../../config/supabase';
import { Ionicons } from '@expo/vector-icons';

type Follower = {
  uid: string;
  follower_id: string;
};

type SearchUser = {
  uid: string;
  username: string;
  profile: {
    name: string;
    imageUrl?: string;
    // ... any other properties
  }
}

// New component to display detailed follower info.
function FollowerListItem({ uid }: { uid: string }) {
  const [data, setData] = useState<{
    user_id: string;
    username: string;
    name?: string;
    image_url?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username, name, image_url')
        .eq('user_id', uid)
        .single();

      if (data) setData(data);
    }
    fetchUser();
  }, [uid]);

  if (!data) {
    return (
      <List.Item
        title="Unknown user"
        left={(props) => <Avatar.Icon {...props} icon="account" />}
      />
    );
  }

  return (
    <TouchableOpacity onPress={() => router.push(`/profile/${uid}`)}>
      <List.Item
        title={data.name || 'Unknown user'}
        description={`@${data.username || 'unknown'}`}
        left={(props) => 
          data.image_url ? (
            <Avatar.Image {...props} size={40} source={{ uri: data.image_url }} />
          ) : (
            <Avatar.Icon {...props} size={40} icon="account" />
          )
        }
      />
    </TouchableOpacity>
  );
}

export default function FollowersScreen() {
  // Get the uid from query parameters.
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const theme = useTheme();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchFollowers() {
      if (!uid) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('followers')
          .select('follower_id')
          .eq('following_id', uid);

        if (data) {
          const list = data.map(item => ({
            uid: item.follower_id,
            follower_id: item.follower_id
          }));
          setFollowers(list);
        }
      } catch (error) {
        console.error("Error fetching followers: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFollowers();
  }, [uid]);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon={() => <Ionicons name="arrow-back" size={24} color="#7C4DFF" />}
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Followers</Text>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : followers.length === 0 ? (
        <Text style={styles.empty}>No followers found</Text>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => <FollowerListItem uid={item.uid} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { textAlign: 'center', marginTop: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
}); 