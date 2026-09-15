import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TabBar, type TabBarItem } from '@/components/TabBar';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { PlaceholderScreen } from '@/screens/PlaceholderScreen';
import { ProDetailsScreen } from '@/screens/ProDetailsScreen';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const TABS: TabBarItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'categories', label: 'Categories', icon: 'grid-outline', activeIcon: 'grid' },
  { key: 'pro', label: 'Bookings', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'messages', label: 'Messages', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* No inset padding here — Header and TabBar float and account for
          insets themselves, so content renders truly edge to edge. */}
      <View style={styles.root} onLayout={onLayoutRootView}>
        <View style={styles.content}>{renderActiveScreen(activeTab)}</View>
        <TabBar items={TABS} activeKey={activeTab} onChange={setActiveTab} />
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

function renderActiveScreen(activeTab: string) {
  switch (activeTab) {
    case 'home':
      return <HomeScreen />;
    case 'categories':
      return <CategoriesScreen />;
    case 'pro':
      return <ProDetailsScreen />;
    case 'messages':
      return <PlaceholderScreen title="Messages" icon="chatbubble-outline" />;
    case 'profile':
      return <PlaceholderScreen title="Profile" icon="person-outline" />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
});
