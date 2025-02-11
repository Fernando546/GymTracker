import { View, StyleSheet, FlatList, BackHandler } from 'react-native';
import { TextInput, Avatar, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

interface User {
  uid: string;
  username: string;
  profile?: {
    name?: string;
    imageUrl?: string;
  };
}

export default function SearchScreen() {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  const searchUsers = async () => {
    if (!searchText) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', searchText),
        where('username', '<=', searchText + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs
        .filter(doc => doc.id !== user?.uid)
        .map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setResults(users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#080808', '#101010', '#181818']} style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <IconButton
          icon={() => <Ionicons name="arrow-back" size={24} color="#7C4DFF" />}
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Search Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Header */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7C4DFF" style={styles.searchIcon} />
        <TextInput
          placeholder="Search users..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchUsers}
          style={styles.searchInput}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          outlineColor="transparent"
          textColor="#fff"
        />
        <Button 
          mode="contained" 
          onPress={searchUsers}
          buttonColor="#7C4DFF"
          style={styles.searchButton}
          labelStyle={{ color: '#fff' }}
        >
          Search
        </Button>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading && searchText ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#7C4DFF" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Avatar.Image 
              size={50} 
              source={{ uri: item.profile?.imageUrl }} 
              style={styles.avatar}
              theme={{ colors: { primary: '#7C4DFF' }}}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>@{item.username}</Text>
              {item.profile?.name && (
                <Text style={styles.name}>{item.profile.name}</Text>
              )}
            </View>
            <Button
              mode="outlined"
              onPress={() => router.push(`/profile/${item.uid}`)}
              textColor="#7C4DFF"
              style={styles.viewButton}
            >
              View
            </Button>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 12,
    borderRadius: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  avatar: {
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#7C4DFF',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#888',
  },
  viewButton: {
    borderRadius: 8,
    borderColor: '#7C4DFF',
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});
