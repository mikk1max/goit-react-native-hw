import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { BookingsScreen } from '@/screens/BookingsScreen';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { CategoryDetailsScreen } from '@/screens/CategoryDetailsScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { MessagesScreen } from '@/screens/MessagesScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ProviderDetailsScreen } from '@/screens/ProviderDetailsScreen';
import { UrgentBookingScreen } from '@/screens/UrgentBookingScreen';

import { SCREENS } from './screens';
import type {
  BookingsStackParamList,
  CategoriesStackParamList,
  HomeStackParamList,
  MessagesStackParamList,
  RootTabParamList,
} from './types';
import type { MainTabsProps } from './MainTabs.native';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();

function HomeStackNavigator() {
  const { colors: themeColors } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.white } }}
    >
      <HomeStack.Screen name={SCREENS.HOME_MAIN} component={HomeScreen} />
      <HomeStack.Screen name={SCREENS.PRO_DETAILS} component={ProDetailsScreen} />
      <HomeStack.Screen name={SCREENS.URGENT_BOOKING} component={UrgentBookingScreen} />
    </HomeStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  const { colors: themeColors } = useTheme();
  return (
    <CategoriesStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.white } }}
    >
      <CategoriesStack.Screen name={SCREENS.CATEGORIES_MAIN} component={CategoriesScreen} />
      <CategoriesStack.Screen name={SCREENS.CATEGORY_DETAILS} component={CategoryDetailsScreen} />
      <CategoriesStack.Screen name={SCREENS.PROVIDER_DETAILS} component={ProviderDetailsScreen} />
    </CategoriesStack.Navigator>
  );
}

function BookingsStackNavigator() {
  const { colors: themeColors } = useTheme();
  return (
    <BookingsStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.white } }}
    >
      <BookingsStack.Screen name={SCREENS.BOOKINGS_MAIN} component={BookingsScreen} />
      <BookingsStack.Screen name={SCREENS.PRO_DETAILS} component={ProDetailsScreen} />
    </BookingsStack.Navigator>
  );
}

function MessagesStackNavigator() {
  const { colors: themeColors } = useTheme();
  return (
    <MessagesStack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.white } }}
    >
      <MessagesStack.Screen name={SCREENS.MESSAGES_MAIN} component={MessagesScreen} />
    </MessagesStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof RootTabParamList, ComponentProps<typeof Ionicons>['name']> = {
  Home: 'home',
  Categories: 'search',
  Bookings: 'calendar',
  Messages: 'chatbubble',
  Profile: 'person',
};

/**
 * react-native-bottom-tabs has no web target (it wraps native UIKit/Compose
 * views), so this dev-only fallback keeps `npm run web` bundling — a plain
 * JS bottom-tabs bar, per the library's own web-platform-support guide.
 * `androidIcons` only exists for MainTabs.native's signature; unused here.
 */
export function MainTabs(_props: MainTabsProps) {
  const { colors: themeColors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textMuted,
        lazy: false,
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Home} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.CATEGORIES}
        component={CategoriesStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Categories} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.BOOKINGS}
        component={BookingsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Bookings} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.MESSAGES}
        component={MessagesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Messages} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Profile} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
