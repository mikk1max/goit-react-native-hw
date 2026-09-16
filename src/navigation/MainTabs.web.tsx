import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/routers';
import type { ComponentProps } from 'react';

import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { CategoryDetailsScreen } from '@/screens/CategoryDetailsScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';
import { ProviderDetailsScreen } from '@/screens/ProviderDetailsScreen';
import { colors } from '@/theme';

import { SCREENS } from './screens';
import type { CategoriesStackParamList, HomeStackParamList, RootTabParamList } from './types';
import type { MainTabsProps } from './MainTabs.native';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();

/** Opens the side Drawer — dispatched actions bubble up to the nearest ancestor that handles them, so this works from any depth. */
function openDrawer() {
  return DrawerActions.openDrawer();
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name={SCREENS.HOME_MAIN} component={HomeScreen} />
      <HomeStack.Screen name={SCREENS.PRO_DETAILS} component={ProDetailsScreen} />
    </HomeStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={{ headerShown: false }}>
      <CategoriesStack.Screen name={SCREENS.CATEGORIES_MAIN} component={CategoriesScreen} />
      <CategoriesStack.Screen name={SCREENS.CATEGORY_DETAILS} component={CategoryDetailsScreen} />
      <CategoriesStack.Screen name={SCREENS.PROVIDER_DETAILS} component={ProviderDetailsScreen} />
    </CategoriesStack.Navigator>
  );
}

/** No bookings-list screen exists yet — see MainTabs.native.tsx's comment. */
function BookingsTab() {
  const navigation = useNavigation();
  return (
    <PlaceholderScreen
      title="Bookings"
      icon="calendar-outline"
      onMenuPress={() => navigation.dispatch(openDrawer())}
    />
  );
}

function MessagesTab() {
  const navigation = useNavigation();
  return (
    <PlaceholderScreen
      title="Messages"
      icon="chatbubble-outline"
      onMenuPress={() => navigation.dispatch(openDrawer())}
    />
  );
}

function ProfileTab() {
  const navigation = useNavigation();
  return (
    <PlaceholderScreen
      title="Profile"
      icon="person-outline"
      onMenuPress={() => navigation.dispatch(openDrawer())}
    />
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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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
        component={BookingsTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Bookings} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.MESSAGES}
        component={MessagesTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Messages} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileTab}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Profile} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
