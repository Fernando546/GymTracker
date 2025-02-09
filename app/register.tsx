import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const accentColor = '#7C4DFF';
  const darkBackground = '#080808';

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    try {
      setError('');
      
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!username.trim()) {
        setError('Username is required');
        return;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters long');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      await signUp(email.toLowerCase().trim(), password, username.trim());
      router.replace('/(app)/home' as any);
    } catch (e: any) {
      console.log('Registration error:', e?.code);
      if (e?.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[darkBackground, '#101010', '#181818']}
      style={styles.container}
    >
      <Text style={[styles.title, { color: '#fff' }]}>Create Account</Text>
      {error && <Text style={[styles.error, { color: accentColor }]}>{error}</Text>}
      
      <View style={styles.form}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          theme={{ colors: { primary: accentColor } }}
          style={styles.input}
          textColor="#fff"
          outlineColor="#333"
          activeOutlineColor={accentColor}
        />
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          theme={{ colors: { primary: accentColor } }}
          style={styles.input}
          textColor="#fff"
          outlineColor="#333"
          activeOutlineColor={accentColor}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          theme={{ colors: { primary: accentColor } }}
          style={styles.input}
          textColor="#fff"
          outlineColor="#333"
          activeOutlineColor={accentColor}
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          theme={{ colors: { primary: accentColor } }}
          style={styles.input}
          textColor="#fff"
          outlineColor="#333"
          activeOutlineColor={accentColor}
        />
        <Button 
          mode="contained"
          onPress={handleRegister}
          style={[styles.button, { backgroundColor: accentColor }]}
          labelStyle={styles.buttonLabel}
          loading={loading}
        >
          Sign Up
        </Button>
      </View>
      
      <View style={styles.footer}>
        <Text style={{ color: '#888' }}>Already have an account? </Text>
        <Link href="/login" asChild>
          <Button 
            mode="text" 
            textColor={accentColor}
            labelStyle={{ fontWeight: '600' }}
          >
            Sign In
          </Button>
        </Link>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
  },
  form: {
    gap: 16,
    maxWidth: 400, // Ograniczenie szerokości formularza
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff10',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 6,
    marginTop: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
