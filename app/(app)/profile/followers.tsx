import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

type Follower = {
  uid: string;
  timestamp: number;
};

export default function FollowersScreen() {
  // Get the uid from query parameters.
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFollowers() {
      if (!uid) return;
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'users', uid, 'followers'));
        const list: Follower[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Follower);
        });
        setFollowers(list);
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
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/profile/${item.uid}`)}>
              <List.Item
                title={item.uid} // You can later enhance this to query more details.
                description="Follower"
                left={(props) => <Avatar.Icon {...props} icon="account" />}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { textAlign: 'center', marginTop: 20 },
}); 