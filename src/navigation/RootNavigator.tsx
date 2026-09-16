import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';

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

  return (
    <DrawerSwipeContext.Provider value={setDrawerSwipeEnabled}>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{ headerShown: false, swipeEnabled: drawerSwipeEnabled }}
          drawerContent={(props) => <DrawerContent {...props} />}
        >
          <Drawer.Screen name={SCREENS.MAIN}>
            {() => <MainTabs androidIcons={androidIcons} />}
          </Drawer.Screen>
          <Drawer.Screen name={SCREENS.HELP} component={HelpScreen} />
          <Drawer.Screen name={SCREENS.CONTACT} component={ContactScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </DrawerSwipeContext.Provider>
  );
}
