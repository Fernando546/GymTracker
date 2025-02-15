import { Link, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const accentColor = '#7C4DFF';
  const darkBackground = '#080808';

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
    <LinearGradient
      colors={[darkBackground, '#101010', '#181818']}
      style={styles.container}
    > 
      {/* Centered Form */}
      <View style={styles.form}>
        <View style={styles.formContent}>
          <View>
            <Text style={styles.title}>Welcome Back</Text>
            {error && <Text style={[styles.error, { color: accentColor }]}>{error}</Text>}
          </View>
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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
          <Button 
            mode="contained"
            onPress={handleLogin}
            style={[styles.button, { backgroundColor: accentColor }]}
            labelStyle={styles.buttonLabel}
            loading={loading}
          >
            Sign In
          </Button>
        </View>
      </View>
  
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ color: '#888' }}>Don't have an account? </Text>
        <Link href="/register" asChild>
          <Button 
            mode="text" 
            textColor={accentColor}
            labelStyle={{ fontWeight: '600' }}
          >
            Create Account
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 16, 
  },
  form: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
    paddingVertical: 20,
  },
  input: {
    backgroundColor: '#ffffff10',
  },
  button: {
    borderRadius: 14,
    marginTop: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  formContent: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    gap: 12, 
  },
});