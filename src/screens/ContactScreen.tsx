import Ionicons from '@expo/vector-icons/Ionicons';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { SCREENS } from '@/navigation/screens';
import type { RootDrawerParamList } from '@/navigation/types';
import { radii, spacing, typography } from '@/theme';

const CHANNELS = [
  { icon: 'mail-outline', label: 'support@fixit.app' },
  { icon: 'call-outline', label: '+1 (555) 010-2024' },
  { icon: 'logo-instagram', label: '@fixit.app' },
] as const;

/** Reached only from the Drawer, not pushed on a stack — "back" returns to the Main tabs directly. */
export function ContactScreen() {
  const navigation = useNavigation<NavigationProp<RootDrawerParamList>>();
  const headerClearance = useFloatingHeaderClearance();
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <View style={[styles.content, { paddingTop: headerClearance }]}>
        {CHANNELS.map((channel) => (
          <View key={channel.label} style={styles.row}>
            <View style={[styles.iconBadge, { backgroundColor: themeColors.primaryLightest }]}>
              <Ionicons name={channel.icon} size={18} color={themeColors.primary} />
            </View>
            <Text style={[typography.bodyM, { color: themeColors.textPrimary }]}>
              {channel.label}
            </Text>
          </View>
        ))}
      </View>

      <Header title="Contact us" onBackPress={() => navigation.navigate(SCREENS.MAIN)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
