import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarHeight } from './useTabBarHeight';

/**
 * react-native-bottom-tabs renders the native tab bar at the TOP on iPad's
 * regular-width size class (iPadOS 18's adaptive tab bar style), not the
 * bottom used everywhere else — but its useTabBarHeight always reports just
 * the bar's own thickness, never which edge it's actually on. This resolves
 * both so the Header/screens can clear whichever edge is really occupied
 * instead of always assuming the bottom.
 */
export function useTabBarLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const isTopTabBar = Platform.OS === 'ios' && Platform.isPad;

  return {
    topClearance: isTopTabBar ? tabBarHeight : 0,
    bottomClearance: isTopTabBar ? insets.bottom : tabBarHeight > 0 ? tabBarHeight : insets.bottom,
  };
}
