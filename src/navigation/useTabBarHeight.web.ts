import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';

/** 0 outside a tab navigator's screen tree — see useTabBarHeight.native.ts. */
export function useTabBarHeight() {
  return useContext(BottomTabBarHeightContext) ?? 0;
}
