import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { ThemeProvider } from '@/context/ThemeContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { TAB_ANDROID_ICON_NAMES, useAndroidTabIcons } from '@/navigation/useAndroidTabIcons';
import type { ResolvedTabIcon } from '@/navigation/useAndroidTabIcons';
import { bootstrapAuth } from '@/store/authSlice';
import { fetchBookings } from '@/store/bookingsSlice';
import { fetchConversations } from '@/store/chatsSlice';
import { loadFavorites } from '@/store/favoritesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { store } from '@/store/store';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

type AppContentProps = {
  fontsAndIconsReady: boolean;
  androidIcons: Record<string, ResolvedTabIcon> | null;
};

/**
 * Split from App() because restoring a saved session (bootstrapAuth) needs
 * useAppSelector/useAppDispatch, which only work below ReduxProvider — this
 * gates the splash screen on that resolving, the same way App() already
 * gates it on fonts/Android icons.
 */
function AppContent({ fontsAndIconsReady, androidIcons }: AppContentProps) {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // Loaded once per sign-in (bootstrap restoring a session counts) rather
  // than per-screen — ProviderProfile/UrgentBookingScreen/BookingsScreen all
  // need the same up-to-date bookings list to compute a pro's availability.
  useEffect(() => {
    if (authStatus === 'authenticated') {
      dispatch(fetchBookings());
      dispatch(fetchConversations());
      dispatch(loadFavorites());
    }
  }, [authStatus, dispatch]);

  const ready = fontsAndIconsReady && authStatus !== 'bootstrapping';

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <RootNavigator androidIcons={androidIcons} />
      <StatusBar style="dark" />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const androidTabIcons = useAndroidTabIcons(TAB_ANDROID_ICON_NAMES, colors.textPrimary);
  // Only Android needs its tab icons rasterized up front; iOS renders sfSymbols natively.
  const fontsAndIconsReady = fontsLoaded && (Platform.OS !== 'android' || androidTabIcons !== null);

  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <AppContent fontsAndIconsReady={fontsAndIconsReady} androidIcons={androidTabIcons} />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
