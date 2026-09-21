import { useCallback } from 'react';
import { Alert } from 'react-native';

import { navigateToSignIn } from '@/navigation/navigationRef';
import { useAppSelector } from '@/store/hooks';

/**
 * Gates a guest-blocked action (booking a pro, messaging one, viewing your
 * own Bookings/Profile) behind an account — signed-in users run `action`
 * immediately, guests see the same kind of confirm-before-you-commit Alert
 * the app already uses for booking (see UrgentBookingScreen/BookingsScreen),
 * with a way to jump straight to Sign in.
 */
export function useRequireAuth() {
  const isAuthenticated = useAppSelector((state) => state.auth.status === 'authenticated');

  return useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
        return;
      }
      Alert.alert('Sign in required', 'Create a free account or sign in to continue.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: navigateToSignIn },
      ]);
    },
    [isAuthenticated],
  );
}
