import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, List, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

type Following = {
  uid: string;
  timestamp: number;
};

export default function FollowingScreen() {
  // Get the uid from query parameters.
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const theme = useTheme();
  const router = useRouter();
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
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/profile/${item.uid}`)}>
              <List.Item
                title={item.uid} // Optionally, query more data to display a proper name.
                description="Following"
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