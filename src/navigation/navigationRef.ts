import { createNavigationContainerRef } from '@react-navigation/native';

import { SCREENS } from './screens';
import type { ChatParams, RootStackParamList } from './types';

/**
 * A ref to the single NavigationContainer (set from RootNavigator), so code
 * that isn't a screen — Redux thunks, the auth-gate helper — can still
 * navigate. Reaches screens pushed on the root Stack (SignIn, SignUp, Chat,
 * Help, Contact, Appearance) from anywhere in the app.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Jumps to one of the root Stack's own screens (Sign in/up, Appearance, ...)
 * from anywhere, including from inside a tab's nested stack — those screens
 * aren't in a tab/stack's own param list, so its typed `navigation` prop
 * can't reach them directly.
 */
type ParameterlessRoute = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
}[keyof RootStackParamList];

export function navigateToRootScreen(name: ParameterlessRoute) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.navigate(name as never);
}

/** Backwards-compatible alias for existing call sites. */
export const navigateToDrawerScreen = navigateToRootScreen;

/** Sends a guest to Sign in, from anywhere in the app. */
export function navigateToSignIn() {
  navigateToRootScreen(SCREENS.SIGN_IN);
}

/**
 * Opens a pro's thread from anywhere — pushes onto the root Stack with native
 * iOS slide animation, hiding the tab bar.
 */
export function navigateToChat(params: ChatParams) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.navigate(SCREENS.CHAT, params);
}

