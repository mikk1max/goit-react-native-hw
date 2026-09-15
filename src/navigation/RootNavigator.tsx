import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TabBar, type TabBarItem } from '@/components/TabBar';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';

import type { HomeStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const TAB_META: Record<keyof RootTabParamList, Omit<TabBarItem, 'key'>> = {
  Home: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  Categories: { label: 'Categories', icon: 'grid-outline', activeIcon: 'grid' },
  Bookings: { label: 'Bookings', icon: 'calendar-outline', activeIcon: 'calendar' },
  Messages: { label: 'Messages', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  Profile: { label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
};

/** Home is the only tab that pushes a detail screen — that's where the native slide + swipe-back shows up. */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ProDetails" component={ProDetailsScreen} />
    </HomeStack.Navigator>
  );
}

function MessagesTab() {
  return <PlaceholderScreen title="Messages" icon="chatbubble-outline" />;
}

function ProfileTab() {
  return <PlaceholderScreen title="Profile" icon="person-outline" />;
}

/** Keeps our floating glass TabBar as the visual, while React Navigation drives focus/routing. */
function renderTabBar({ state, navigation }: BottomTabBarProps) {
  const items: TabBarItem[] = state.routes.map((route) => ({
    key: route.name,
    ...TAB_META[route.name as keyof RootTabParamList],
  }));

  return (
    <TabBar
      items={items}
      activeKey={state.routes[state.index].name}
      onChange={(key) => navigation.navigate(key)}
    />
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
        <Tab.Screen name="Bookings" component={ProDetailsScreen} />
        <Tab.Screen name="Messages" component={MessagesTab} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
