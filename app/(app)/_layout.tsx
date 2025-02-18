import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';

export default function AppLayout() {
  const accentColor = '#7C4DFF';
  const darkBackground = '#080808';

  useFocusEffect(() => {
    const onBackPress = () => {
      // Prevent going back to auth screens
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: darkBackground,
          borderTopWidth: 0,
          height: 60,
          paddingHorizontal: 16,
        },
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
          height: 56,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={focused ? 'barbell' : 'barbell-outline'} 
                size={24} 
                color={color} 
              />
              {focused && (
                <LinearGradient
                  colors={[accentColor, '#651FFF']}
                  style={[styles.activeIndicator, styles.gradientIndicator]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: 4,
  },
  activeIndicator: {
    position: 'absolute',
    top: -16,
    height: 3,
    width: '140%',
    backgroundColor: '#7C4DFF',
    borderRadius: 2,
  },
  gradientIndicator: {
    height: 4,
  },
  tabBarBackground: {
    flex: 1,
    width: '100%',
  },
});