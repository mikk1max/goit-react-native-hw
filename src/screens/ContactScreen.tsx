import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { SCREENS } from '@/navigation/screens';
import type { RootDrawerParamList } from '@/navigation/types';
import { colors, radii, spacing, typography } from '@/theme';

const CHANNELS = [
  { icon: 'mail-outline', label: 'support@fixit.app' },
  { icon: 'call-outline', label: '+1 (555) 010-2024' },
  { icon: 'logo-instagram', label: '@fixit.app' },
] as const;

/** Reached only from the Drawer, not pushed on a stack — "back" returns to the Main tabs directly. */
export function ContactScreen() {
  const navigation = useNavigation<NavigationProp<RootDrawerParamList>>();
  const headerClearance = useFloatingHeaderClearance();

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: headerClearance }]}>
        {CHANNELS.map((channel) => (
          <View key={channel.label} style={styles.row}>
            <View style={styles.iconBadge}>
              <Ionicons name={channel.icon} size={18} color={colors.primary} />
            </View>
            <Text style={typography.bodyM}>{channel.label}</Text>
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.primaryLightest,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
