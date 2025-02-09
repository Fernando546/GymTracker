import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { TextInput, Text, Avatar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', searchText),
        where('username', '<=', searchText + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      let users: any[] = [];
      snapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() });
      });
      if (user && user.uid) {
        users = users.filter((item) => item.uid !== user.uid);
      }
      setResults(users);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchText]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}
        placeholder="Search users..."
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={searchText}
        onChangeText={setSearchText}
      />
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 16 }}>Loading...</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/profile/${item.uid}`)}>
              <View style={styles.itemContainer}>
                {item?.profile?.imageUrl ? (
                  <Avatar.Image size={40} source={{ uri: item.profile.imageUrl }} />
                ) : (
                  <Avatar.Icon icon="account" size={40} />
                )}
                <Text style={[styles.username, { color: theme.colors.onBackground }]}>
                  {item.username}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
              No users found.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    padding: 8,
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  username: {
    marginLeft: 12,
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
}); 