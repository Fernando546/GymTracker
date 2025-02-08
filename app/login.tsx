import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

export default function Login() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password');
        return;
      }
      setLoading(true);
      await signIn(email.toLowerCase().trim(), password);
      router.replace('/(app)/home' as any);
    } catch (e: any) {
      console.log('Login error:', e?.code);
      if (e?.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (e?.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          disabled={loading}
        />
        <Button 
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
      </View>
      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <Link href="/register" asChild>
          <Button mode="text">Register</Button>
        </Link>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginBottom: 12,
    textAlign: 'center',
  },
}); 