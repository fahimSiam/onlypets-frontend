import { Tabs, Redirect } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth.store';
import { router } from 'expo-router';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6BC24A',
        tabBarInactiveTintColor: '#555',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shorts/index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'play-circle' : 'play-circle-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => router.push('/modals/create-post')}
              style={styles.createBtnWrap}
              activeOpacity={0.85}
            >
              <View style={styles.createBtn}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="discovery/index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'compass' : 'compass-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="swipe/index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'heart' : 'heart-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 0.5,
    borderTopColor: '#1E1E1E',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  createBtnWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#6BC24A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6BC24A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
