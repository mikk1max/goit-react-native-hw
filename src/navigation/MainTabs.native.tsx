import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/routers';
import { Platform } from 'react-native';
import type { AppleIcon } from 'react-native-bottom-tabs';

import { useTheme } from '@/context/ThemeContext';
import { BookingsScreen } from '@/screens/BookingsScreen';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { CategoryDetailsScreen } from '@/screens/CategoryDetailsScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';
import { ProviderDetailsScreen } from '@/screens/ProviderDetailsScreen';
import { UrgentBookingScreen } from '@/screens/UrgentBookingScreen';

import { SCREENS } from './screens';
import type { CategoriesStackParamList, HomeStackParamList, RootTabParamList } from './types';
import type { ResolvedTabIcon } from './useAndroidTabIcons';

const Tab = createNativeBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();

/** Opens the side Drawer — dispatched actions bubble up to the nearest ancestor that handles them, so this works from any depth. */
function openDrawer() {
  return DrawerActions.openDrawer();
}

/** Home pushes a Pro Details screen — that's where the native slide + swipe-back shows up. */
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

/** Categories pushes a live provider directory, then a provider's own profile. */
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

export type MainTabsProps = {
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
  androidIcons: MainTabsProps['androidIcons'],
) {
  return ({ focused }: { focused: boolean }) => {
    if (Platform.OS === 'ios') {
      return { sfSymbol: typeof sf === 'string' ? sf : focused ? sf.selected : sf.default };
    }
    // App.tsx doesn't render MainTabs until useAndroidTabIcons has resolved
    // on Android, so this is always populated by the time we get here.
    return androidIcons![androidKey];
  };
}

/** The app's 5-tab home — rendered as the Drawer's "Main" screen (see RootNavigator.tsx). */
export function MainTabs({ androidIcons }: MainTabsProps) {
  const { colors: themeColors } = useTheme();

  return (
    <Tab.Navigator
      tabBarActiveTintColor={themeColors.primary}
      tabBarInactiveTintColor={themeColors.textMuted}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: makeTabIcon(
            { default: 'house', selected: 'house.fill' },
            SCREENS.HOME,
            androidIcons,
          ),
        }}
      />
      {/* Route name stays "Categories" (matches the screen's own title); the
          Figma tab bar labels this tab "Search" — see mockData/MainTabs notes. */}
      <Tab.Screen
        name={SCREENS.CATEGORIES}
        component={CategoriesStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: makeTabIcon('magnifyingglass', SCREENS.CATEGORIES, androidIcons),
        }}
      />
      <Tab.Screen
        name={SCREENS.BOOKINGS}
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: makeTabIcon('calendar', SCREENS.BOOKINGS, androidIcons),
        }}
      />
      <Tab.Screen
        name={SCREENS.MESSAGES}
        component={MessagesTab}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: makeTabIcon(
            { default: 'bubble.left', selected: 'bubble.left.fill' },
            SCREENS.MESSAGES,
            androidIcons,
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileTab}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: makeTabIcon(
            { default: 'person.crop.circle', selected: 'person.crop.circle.fill' },
            SCREENS.PROFILE,
            androidIcons,
          ),
        }}
      />
    </Tab.Navigator>
  );
}
