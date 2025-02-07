import { Stack } from 'expo-router';
import { PaperProvider, MD3DarkTheme, adaptNavigationTheme, configureFonts } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { useMemo } from 'react';
import { Platform } from 'react-native';

export default function Layout() {
  // Merge navigation theme with Paper theme
  const { DarkTheme } = adaptNavigationTheme({
    reactNavigationDark: NavigationDarkTheme,
  });

  const fontConfig = {
    customVariant: configureFonts({
      config: {
        fontFamily: Platform.select({
          web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
          ios: 'System',
          default: 'sans-serif',
        }),
      },
    }),
  };

  const combinedTheme = useMemo(() => ({
    ...MD3DarkTheme,
    ...DarkTheme,
    fonts: fontConfig.customVariant,
    colors: {
      ...MD3DarkTheme.colors,
      ...DarkTheme.colors,
      // Custom colors
      primary: '#2196F3',
      background: '#121212',
      surface: '#1E1E1E',
      card: '#252525',
    },
    // Override all text variants
    textVariants: {
      labelLarge: {
        fontWeight: 'medium',
      },
      labelMedium: {
        fontWeight: 'medium',
      },
      labelSmall: {
        fontWeight: 'medium',
      },
      bodyLarge: {
        fontWeight: 'regular',
      },
      bodyMedium: {
        fontWeight: 'regular',
      },
      bodySmall: {
        fontWeight: 'regular',
      },
      titleLarge: {
        fontWeight: 'bold',
      },
      titleMedium: {
        fontWeight: 'bold',
      },
      titleSmall: {
        fontWeight: 'bold',
      },
      headlineLarge: {
        fontWeight: 'heavy',
      },
      headlineMedium: {
        fontWeight: 'heavy',
      },
      headlineSmall: {
        fontWeight: 'heavy',
      },
    },
  }), []);

  return (
    <PaperProvider theme={combinedTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: combinedTheme.colors.surface,
          },
          headerTintColor: combinedTheme.colors.onSurface,
          headerTitleStyle: {
            color: combinedTheme.colors.onSurface,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="login"
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="register"
          options={{
            title: 'Register',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="(app)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
