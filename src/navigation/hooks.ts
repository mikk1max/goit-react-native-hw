import { useNavigation } from '@react-navigation/native';

/**
 * `navigation.canGoBack()` bubbles up to ancestor navigators — a bottom-tabs
 * navigator's default `backBehavior: 'history'` means it reports `true` app-wide
 * once more than one tab has been visited. This only checks whether THIS
 * screen's own immediate parent stack has a screen before it, so a screen used
 * both as a pushed stack screen and as a flat tab root shows a back button
 * only in the former case.
 */
export function useCanGoBackLocally(): boolean {
  const navigation = useNavigation();
  const state = navigation.getState();
  return state?.type === 'stack' && state.index > 0;
}
