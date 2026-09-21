import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { AppearanceScreen } from '@/screens/AppearanceScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { ContactScreen } from '@/screens/ContactScreen';
import { HelpScreen } from '@/screens/HelpScreen';
import { SignInScreen } from '@/screens/SignInScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';

import { DrawerContent } from './DrawerContent';
import { DrawerSwipeContext, DrawerSwipeValueContext, useDrawerSwipeEnabled } from './DrawerSwipeContext';
import { MainTabs } from './MainTabs';
import type { MainTabsProps } from './MainTabs';
import { navigationRef } from './navigationRef';
import { SCREENS } from './screens';
import type { RootDrawerParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

const AndroidIconsContext = createContext<MainTabsProps['androidIcons']>(null);

export type RootNavigatorProps = MainTabsProps;

/**
 * DrawerNavigator houses the 5-tab app ("DrawerMain" -> MainTabs) and its slide-out menu.
 * Defined as a stable top-level component so React Navigation never unmounts the tab tree
 * when drawerSwipeEnabled changes.
 */
function DrawerNavigator() {
  const { colors: themeColors } = useTheme();
  const drawerSwipeEnabled = useDrawerSwipeEnabled();
  const androidIcons = useContext(AndroidIconsContext);

  const drawerScreenOptions = useMemo(
    () => ({
      headerShown: false,
      swipeEnabled: drawerSwipeEnabled,
      drawerStyle: { backgroundColor: themeColors.white },
      sceneContainerStyle: { backgroundColor: themeColors.white },
    }),
    [drawerSwipeEnabled, themeColors],
  );

  const renderMainTabs = useCallback(
    () => <MainTabs androidIcons={androidIcons} />,
    [androidIcons],
  );

  return (
    <Drawer.Navigator
      screenOptions={drawerScreenOptions}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name={SCREENS.DRAWER_MAIN}>{renderMainTabs}</Drawer.Screen>
    </Drawer.Navigator>
  );
}

/**
 * Root Stack Navigator wraps the Drawer and all secondary/detail screens
 * (Help, Contact, Appearance, SignIn, SignUp, Chat) inside a native iOS stack.
 *
 * This provides the exact same native 60/120fps slide-from-right animation,
 * interactive edge swipe-back gesture, and tab-bar hiding across all screens.
 */
export function RootNavigator({ androidIcons }: RootNavigatorProps) {
  const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useState(true);
  const { theme, colors: themeColors } = useTheme();

  const navigationTheme = useMemo(() => {
    const base = theme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: themeColors.white,
        card: themeColors.white,
        text: themeColors.textPrimary,
        border: themeColors.borderLight,
        primary: themeColors.primary,
      },
    };
  }, [theme, themeColors]);

  const stackScreenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: 'default' as const,
      contentStyle: { backgroundColor: themeColors.white },
    }),
    [themeColors],
  );

  return (
    <DrawerSwipeContext.Provider value={setDrawerSwipeEnabled}>
      <DrawerSwipeValueContext.Provider value={drawerSwipeEnabled}>
        <AndroidIconsContext.Provider value={androidIcons}>
          <NavigationContainer ref={navigationRef} theme={navigationTheme}>
            <Stack.Navigator screenOptions={stackScreenOptions}>
              <Stack.Screen name={SCREENS.MAIN} component={DrawerNavigator} />
              <Stack.Screen name={SCREENS.HELP} component={HelpScreen} />
              <Stack.Screen name={SCREENS.CONTACT} component={ContactScreen} />
              <Stack.Screen name={SCREENS.APPEARANCE} component={AppearanceScreen} />
              <Stack.Screen name={SCREENS.SIGN_IN} component={SignInScreen} />
              <Stack.Screen name={SCREENS.SIGN_UP} component={SignUpScreen} />
              <Stack.Screen name={SCREENS.CHAT} component={ChatScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AndroidIconsContext.Provider>
      </DrawerSwipeValueContext.Provider>
    </DrawerSwipeContext.Provider>
  );
}
