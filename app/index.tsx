import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export default function Index() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text 
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Welcome to GymTracker
        </Text>
        <Text 
          style={[styles.subtitle, { color: theme.colors.onBackground }]}
        >
          Start your fitness journey today
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Link href={'/login' as any} asChild>
          <Button 
            mode="contained" 
            style={styles.button}
            buttonColor={theme.colors.primary}
          >
            Login
          </Button>
        </Link>

        <Text style={[styles.orText, { color: theme.colors.onBackground }]}>or</Text>

        <Link href={'/register' as any} asChild>
          <Button 
            mode="outlined" 
            style={styles.button}
            textColor={theme.colors.primary}
          >
            Register
          </Button>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 8,
  },
  orText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
}); 