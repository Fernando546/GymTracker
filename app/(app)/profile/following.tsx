import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

type Following = {
  uid: string;
  timestamp: number;
};

// New component to display detailed following info.
function FollowingListItem({ uid }: { uid: string }) {
  const [data, setData] = useState<{ username: string; profile: { name: string; imageUrl?: string } } | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setData(docSnap.data() as { username: string; profile: { name: string; imageUrl?: string } });
      }
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

export default function FollowingScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const theme = useTheme();
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowing() {
      if (!uid) return;
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'users', uid, 'following'));
        const list: Following[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Following);
        });
        setFollowing(list);
      } catch (error) {
        console.error("Error fetching following: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFollowing();
  }, [uid]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <Text>Loading...</Text>
      ) : following.length === 0 ? (
        <Text style={styles.empty}>No following found</Text>
      ) : (
        <FlatList
          data={following}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => <FollowingListItem uid={item.uid} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { textAlign: 'center', marginTop: 20 },
}); 