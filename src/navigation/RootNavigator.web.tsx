import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';

import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';
import { colors } from '@/theme';

import type { HomeStackParamList, RootTabParamList } from './types';
import type { RootNavigatorProps } from './RootNavigator.native';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ProDetails" component={ProDetailsScreen} />
    </HomeStack.Navigator>
  );
}

/** No bookings-list screen exists yet — see RootNavigator.native.tsx's comment. */
function BookingsTab() {
  return <PlaceholderScreen title="Bookings" icon="calendar-outline" />;
}

function MessagesTab() {
  return <PlaceholderScreen title="Messages" icon="chatbubble-outline" />;
}

function ProfileTab() {
  return <PlaceholderScreen title="Profile" icon="person-outline" />;
}

const TAB_ICONS: Record<keyof RootTabParamList, ComponentProps<typeof Ionicons>['name']> = {
  Home: 'home',
  Categories: 'grid',
  Bookings: 'calendar',
  Messages: 'chatbubble',
  Profile: 'person',
};

/**
 * react-native-bottom-tabs has no web target (it wraps native UIKit/Compose
 * views), so this dev-only fallback keeps `npm run web` bundling — a plain
 * JS bottom-tabs bar, per the library's own web-platform-support guide.
 * `androidIcons` only exists for RootNavigator.native's signature; unused here.
 */
export function RootNavigator(_props: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS.Home} size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS.Categories} size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsTab}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS.Bookings} size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Messages"
          component={MessagesTab}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS.Messages} size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileTab}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS.Profile} size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
