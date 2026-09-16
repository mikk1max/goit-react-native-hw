import { useContext } from 'react';
import { BottomTabBarHeightContext } from 'react-native-bottom-tabs';

/**
 * 0 outside a tab navigator's screen tree — e.g. Help/Contact, which live
 * on the Drawer next to "Main" rather than inside its tab bar, so they need
 * no bottom-tab clearance at all instead of react-native-bottom-tabs'
 * throwing useBottomTabBarHeight().
 */
export function useTabBarHeight() {
  return useContext(BottomTabBarHeightContext) ?? 0;
}
