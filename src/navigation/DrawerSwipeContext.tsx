import { createContext, useContext } from 'react';

export type SetDrawerSwipeEnabled = (enabled: boolean) => void;

export const DrawerSwipeContext = createContext<SetDrawerSwipeEnabled | null>(null);

/**
 * Lets whichever screen is focused declare whether the Drawer's own
 * left-edge swipe-to-open should be active. Header calls this for every
 * screen it renders (see Header.tsx) instead of each screen wiring it up
 * itself: a screen with a back button turns it off, since native-stack's
 * own swipe-back gesture lives on that same left edge — with both enabled
 * at once they fight over the gesture, so "swipe from the edge" opened the
 * Drawer or went back depending on which handler happened to claim the
 * touch first. A screen with the hamburger menu button turns it back on.
 */
export function useSetDrawerSwipeEnabled(): SetDrawerSwipeEnabled {
  const setSwipeEnabled = useContext(DrawerSwipeContext);
  if (!setSwipeEnabled) {
    throw new Error('useSetDrawerSwipeEnabled must be used inside RootNavigator.');
  }
  return setSwipeEnabled;
}
