import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { BackHandler } from 'react-native';
import { useFocusEffect, useSegments } from 'expo-router';
import React from 'react';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { adaptNavigationTheme } from 'react-native-paper';

export default function AppLayout() {
  const theme = useTheme();
  const segments = useSegments();
  // Construct the current path from the segments.
  const routePath = segments.join("/");
  // Define the base tab routes where we want to block the hardware back button.
  const blockRoutes = [
    "(app)/home/index",
    "(app)/workout/index",
    "(app)/profile/index"
  ];
  
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Block back if at the base level (assumed when segments length <= 2)
        if (segments.length <= 2) {
          return true; // Block hardware back button.
        }
        return false; // Allow default behavior in nested screens.
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [segments])
  );

  const { DarkTheme } = adaptNavigationTheme({
    reactNavigationDark: NavigationDarkTheme,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => (
            <Ionicons name="barbell-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
