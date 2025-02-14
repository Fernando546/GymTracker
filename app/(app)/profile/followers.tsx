import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import supabase from '../../config/supabase';

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
  const [data, setData] = useState<{ username: string; profile: { name: string; imageUrl?: string } } | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase
        .from('users')
        .select('username, profile')
        .eq('id', uid)
        .single();

      if (data) setData({ username: data.username, profile: data.profile });
      setLoadingItem(false);
    }
    fetchUser();
  }, [uid]);

  if (loadingItem) {
    return (
      <List.Item
        title="Loading..."
        left={(props) => <Avatar.Icon {...props} icon="account" />}
      />
    );
  }

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
        title={data.profile.name}
        description={`@${data.username}`}
        left={(props) => 
          data.profile?.imageUrl ? (
            <Avatar.Image {...props} size={40} source={{ uri: data.profile.imageUrl }} />
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
}); 