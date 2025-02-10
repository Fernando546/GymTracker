import { Link } from 'expo-router';
import { StyleSheet, View, Linking } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const customTheme = {
  colors: {
    primary: '#7C4DFF',
    accent: '#7C4DFF',
    background: '#080808',
    surface: '#121212',
    text: '#ffffff',
    disabled: '#444444',
    placeholder: '#888888',
    backdrop: '#000000',
  },
};

export default function Index() {
  const accentColor = '#7C4DFF';
  const darkBackground = '#080808';

  const handleGithubPress = () => {
    Linking.openURL('https://github.com/Fernando546');
  };

  return (
    <LinearGradient
      colors={[darkBackground, '#101010', '#181818']}
      style={styles.container}
    >
      {/* Decorative elements */}
      <View style={[styles.circle, styles.circle1, { 
        backgroundColor: '#7C4DFF20', 
        width: 400, 
        height: 400 
      }]} />
      <View style={[styles.circle, styles.circle2, { 
        backgroundColor: '#7C4DFF15', 
        width: 300, 
        height: 300 
      }]} />
      <View style={[styles.circle, styles.circle3, { 
        backgroundColor: '#7C4DFF10', 
        width: 250, 
        height: 250 
      }]} />

      <View style={styles.content}>
        <Ionicons 
          name="barbell" 
          size={96} 
          color={accentColor}
          style={styles.logo} 
        />
        
        <Text style={styles.title}>
          Welcome to{'\n'}
          <Text style={[ { color: accentColor, fontWeight: "bold" }]}>GymTracker</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Transform your fitness journey with{'\n'}personalized tracking & insights
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Link href={'/login' as any} asChild>
          <Button 
            mode="contained" 
            style={[styles.button, { 
              backgroundColor: accentColor,
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }]}
            labelStyle={[styles.buttonLabel, { color: '#fff' }]}
            icon="login"
            theme={customTheme}
          >
            Sign In
          </Button>
        </Link>

        <View style={styles.separator}>
          <View style={[styles.separatorLine, { backgroundColor: '#ffffff10' }]} />
          <Text style={[styles.separatorText, { color: '#ffffff55' }]}>OR</Text>
          <View style={[styles.separatorLine, { backgroundColor: '#ffffff10' }]} />
        </View>

        <Link href={'/register' as any} asChild>
          <Button 
            mode="outlined" 
            style={[styles.button, { 
              borderColor: accentColor,
              borderWidth: 2,
            }]}
            labelStyle={[styles.buttonLabel, { color: accentColor }]}
            icon="account-plus"
          >
            Create Account
          </Button>
        </Link>
      </View>

      {/* Footer with creator credit */}
      <View style={styles.footer}>
        <Text 
          style={styles.footerText}
          onPress={handleGithubPress}
        >
          App created by Fernando
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999999',
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 24,
    width: '100%',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    elevation: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    fontWeight: '700',
    fontSize: 12,
  },
  circle: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.4,
  },
  circle1: {
    top: -150,
    left: -150,
  },
  circle2: {
    bottom: -100,
    right: -100,
  },
  circle3: {
    top: '30%',
    left: '60%',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});