import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type ErrorProps = {
  error: Error;
};

export default function ErrorBoundary({ error }: ErrorProps) {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Error' }} />
      <Text style={styles.title}>Something went wrong!</Text>
      <Text>{error.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
}); 