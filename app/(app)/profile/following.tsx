import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Text, Avatar, List, useTheme, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import supabase from '../../config/supabase';
import { Ionicons } from '@expo/vector-icons';

type Following = {
  following_id: string;
};

// New component to display detailed following info.
function FollowingListItem({ uid }: { uid: string }) {
  const [data, setData] = useState<{
    user_id: string;
    username: string;
    name?: string;
    image_url?: string;
  } | null>(null);

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

  return (
    <TouchableOpacity onPress={() => router.push(`/profile/${uid}`)}>
      <List.Item
        title={data?.name || 'Unknown user'}
        description={`@${data?.username || 'unknown'}`}
        left={(props) => 
          data?.image_url ? (
            <Avatar.Image {...props} size={40} source={{ uri: data.image_url }} />
          ) : (
            <Avatar.Icon {...props} size={40} icon="account" />
          )
        }
      />
    </TouchableOpacity>
  );
}

export default function FollowingScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const theme = useTheme();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchFollowing() {
      if (!uid) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', uid);

        if (data) setFollowing(data.map(item => ({ following_id: item.following_id })));
      } catch (error) {
        console.error("Error fetching following: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFollowing();
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
        <Text style={styles.title}>Following</Text>
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : following.length === 0 ? (
        <Text style={styles.empty}>No following found</Text>
      ) : (
        <FlatList
          data={following}
          keyExtractor={(item) => item.following_id}
          renderItem={({ item }) => <FollowingListItem uid={item.following_id} />}
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