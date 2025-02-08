import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { TextInput, Text, List, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

type User = {
  uid: string;
  username: string;
  profile: {
    name: string;
    imageUrl?: string;
  };
};

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      console.log('Puste zapytanie');
      return;
    }
    
    setLoading(true);
    console.log('Szukam użytkownika:', searchTerm.toLowerCase().trim());
  
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '>=', searchTerm.trim()), where('username', '<=', searchTerm.trim() + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      
      console.log('Liczba wyników:', querySnapshot.size);
  
      if (querySnapshot.empty) {
        console.log('Brak użytkowników o podanym username');
        setResults([]);
        return;
      }
  
      const userList: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('Znaleziony dokument:', userData);
        
        if (!userData.username) {
          console.error('Dokument bez username:', doc.id);
          return;
        }
  
        userList.push({ uid: doc.id, ...userData } as User);
      });
  
      setResults(userList);
    } catch (error) {
      console.error('Błąd podczas wyszukiwania użytkowników:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/profile/${item.uid}`)}
    >
      <List.Item
        title={item.profile.name || item.username}
        description={`@${item.username}`}
        left={(props) => <List.Icon {...props} icon="account" />}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        placeholder="Search users by username"
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
        style={styles.input}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading && searchTerm ? <Text style={styles.empty}>No users found</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  item: {
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
  },
}); 