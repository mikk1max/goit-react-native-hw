import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { ContactScreen } from '@/screens/ContactScreen';
import { HelpScreen } from '@/screens/HelpScreen';

import { DrawerContent } from './DrawerContent';
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
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        {/* Pro Details' own edge-swipe (native-stack's swipe-back) shares the
            left edge with the Drawer's open gesture. Ideally the Drawer's
            swipe would disable itself while Pro Details is focused (the usual
            `getFocusedRouteNameFromRoute` recipe), but react-native-bottom-tabs
            doesn't propagate that nested-stack route change up through the
            Drawer, so the Drawer wins the conflict — the Header's back
            button is the reliable way back from Pro Details either way. */}
        <Drawer.Screen name={SCREENS.MAIN}>
          {() => <MainTabs androidIcons={androidIcons} />}
        </Drawer.Screen>
        <Drawer.Screen name={SCREENS.HELP} component={HelpScreen} />
        <Drawer.Screen name={SCREENS.CONTACT} component={ContactScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
