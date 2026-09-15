import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Metro (and tsc, via tsconfig's moduleSuffixes) resolve RootNavigator.native.tsx/.web.tsx
// fine; eslint-import-resolver-typescript doesn't know about moduleSuffixes yet.
// eslint-disable-next-line import/no-unresolved
import { RootNavigator } from '@/navigation/RootNavigator';
import { TAB_ANDROID_ICON_NAMES, useAndroidTabIcons } from '@/navigation/useAndroidTabIcons';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const androidTabIcons = useAndroidTabIcons(TAB_ANDROID_ICON_NAMES, colors.textPrimary);
  // Only Android needs its tab icons rasterized up front; iOS renders sfSymbols natively.
  const ready = fontsLoaded && (Platform.OS !== 'android' || androidTabIcons !== null);

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayoutRootView}>
          <RootNavigator androidIcons={androidTabIcons} />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
