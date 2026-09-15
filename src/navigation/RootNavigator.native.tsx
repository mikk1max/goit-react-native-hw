import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import type { AppleIcon } from 'react-native-bottom-tabs';

import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';
import { colors } from '@/theme';

import type { HomeStackParamList, RootTabParamList } from './types';
import type { ResolvedTabIcon } from './useAndroidTabIcons';

const Tab = createNativeBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

/**
 * There's no bookings-list screen yet (not part of this assignment's Figma
 * frames — see the Roadmap), so this tab is an honest "coming soon" rather
 * than showing an unrelated pro's profile as a placeholder for it.
 */
function BookingsTab() {
  return <PlaceholderScreen title="Bookings" icon="calendar-outline" />;
}

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

export type RootNavigatorProps = {
  /**
   * Rasterized Ionicons for Android, resolved once in App.tsx before this ever
   * renders (see useAndroidTabIcons) — always populated by the time we get
   * here on Android; always null and unused on iOS, which uses sfSymbol instead.
   */
  androidIcons: Record<string, ResolvedTabIcon> | null;
};

type SFSymbolName = AppleIcon['sfSymbol'];
type SfSymbolPair = SFSymbolName | { default: SFSymbolName; selected: SFSymbolName };

/** iOS gets real SF Symbols; Android gets the pre-rasterized Ionicons image for that tab. */
function makeTabIcon(
  sf: SfSymbolPair,
  androidKey: string,
  androidIcons: RootNavigatorProps['androidIcons'],
) {
  return ({ focused }: { focused: boolean }) => {
    if (Platform.OS === 'ios') {
      return { sfSymbol: typeof sf === 'string' ? sf : focused ? sf.selected : sf.default };
    }
    // App.tsx doesn't render RootNavigator until useAndroidTabIcons has resolved
    // on Android, so this is always populated by the time we get here.
    return androidIcons![androidKey];
  };
}

export function RootNavigator({ androidIcons }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarActiveTintColor={colors.primary}
        tabBarInactiveTintColor={colors.textMuted}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: makeTabIcon(
              { default: 'house', selected: 'house.fill' },
              'Home',
              androidIcons,
            ),
          }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            tabBarLabel: 'Categories',
            tabBarIcon: makeTabIcon(
              { default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' },
              'Categories',
              androidIcons,
            ),
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsTab}
          options={{
            tabBarLabel: 'Bookings',
            tabBarIcon: makeTabIcon('calendar', 'Bookings', androidIcons),
          }}
        />
        <Tab.Screen
          name="Messages"
          component={MessagesTab}
          options={{
            tabBarLabel: 'Messages',
            tabBarIcon: makeTabIcon(
              { default: 'bubble.left', selected: 'bubble.left.fill' },
              'Messages',
              androidIcons,
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileTab}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: makeTabIcon(
              { default: 'person.crop.circle', selected: 'person.crop.circle.fill' },
              'Profile',
              androidIcons,
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
