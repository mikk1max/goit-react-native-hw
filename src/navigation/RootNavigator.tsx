import { createDrawerNavigator } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useMemo, useState } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { AppearanceScreen } from '@/screens/AppearanceScreen';
import { ContactScreen } from '@/screens/ContactScreen';
import { HelpScreen } from '@/screens/HelpScreen';

import { DrawerContent } from './DrawerContent';
import { DrawerSwipeContext } from './DrawerSwipeContext';
import { MainTabs } from './MainTabs';
import type { MainTabsProps } from './MainTabs';
import { SCREENS } from './screens';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export type RootNavigatorProps = MainTabsProps;

/**
 * The whole app lives inside a Drawer: "Main" is the 5-tab app (Stack +
 * Tab navigation), Help/Contact are Drawer-only screens with no tab bar of
 * their own. This is the single NavigationContainer for the app — MainTabs
 * no longer renders its own.
 */
export function RootNavigator({ androidIcons }: RootNavigatorProps) {
  // Whichever screen is currently focused — anywhere in the app, however
  // deep — declares this through Header (see DrawerSwipeContext.tsx), since
  // react-native-bottom-tabs doesn't propagate nested-stack route changes up
  // through the Drawer the way `getFocusedRouteNameFromRoute` would need.
  const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useState(true);
  const { theme, colors: themeColors } = useTheme();

  // Keeps React Navigation's own chrome (screen-transition backgrounds, the
  // Drawer's default container) from flashing light-mode white behind ours.
  // Memoized against theme alone — Header's focus effect flips
  // drawerSwipeEnabled on every tab switch, and an unmemoized theme object
  // recreated on that unrelated re-render was what made the tab bar (and
  // everything else React Navigation themes) visibly flash while navigating.
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

  const drawerScreenOptions = useMemo(
    () => ({
      headerShown: false,
      swipeEnabled: drawerSwipeEnabled,
      drawerStyle: { backgroundColor: themeColors.white },
      sceneContainerStyle: { backgroundColor: themeColors.white },
    }),
    [drawerSwipeEnabled, themeColors],
  );

  return (
    <DrawerSwipeContext.Provider value={setDrawerSwipeEnabled}>
      <NavigationContainer theme={navigationTheme}>
        <Drawer.Navigator
          screenOptions={drawerScreenOptions}
          drawerContent={(props) => <DrawerContent {...props} />}
        >
          <Drawer.Screen name={SCREENS.MAIN}>
            {() => <MainTabs androidIcons={androidIcons} />}
          </Drawer.Screen>
          <Drawer.Screen name={SCREENS.HELP} component={HelpScreen} />
          <Drawer.Screen name={SCREENS.CONTACT} component={ContactScreen} />
          <Drawer.Screen name={SCREENS.APPEARANCE} component={AppearanceScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </DrawerSwipeContext.Provider>
  );
}
