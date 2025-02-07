import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useState } from 'react';

export default function Login() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add login logic here
    router.replace('/(app)/home' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Login
      </Text>

      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
        />
        <Button 
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
        >
          Login
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.onBackground }}>
          Don't have an account?{' '}
          <Link href={'/register' as any} style={{ color: theme.colors.primary }}>
            Register
          </Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
}); 