import { Ionicons } from '@expo/vector-icons';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { colors, radii, spacing, typography } from '@/theme';

import { SCREENS } from './screens';

type IconName = ComponentProps<typeof Ionicons>['name'];

type MenuRowProps = {
  icon: IconName;
  label: string;
  tintColor?: string;
  onPress: () => void;
};

function MenuRow({ icon, label, tintColor = colors.textPrimary, onPress }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Ionicons name={icon} size={20} color={tintColor} />
      <Text style={[typography.bodyM, styles.rowLabel, { color: tintColor }]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Custom Drawer content, styled to match the rest of the app instead of the
 * library's default list — this is what "☰" (the menu button on every root
 * tab screen) opens. Sign out has nothing to actually sign out of (no auth
 * in this app), so it's an honest placeholder alert rather than a real screen.
 *
 * Uses a plain ScrollView, not the library's own DrawerContentScrollView —
 * that one wraps content in a reanimated/gesture-handler pan responder that,
 * with this project's reanimated version, throws a worklets "tried to
 * synchronously call a Remote Function" error on every press inside it. A
 * plain ScrollView sidesteps that; this content is short and rarely scrolls.
 */
export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.profile}>
        <Avatar size="lg" />
        <Text style={[typography.h4, styles.name]}>Guest</Text>
        <Text style={[typography.bodyS, styles.tagline]}>Welcome to FixIt</Text>
      </View>

      <View style={styles.divider} />

      <MenuRow
        icon="help-circle-outline"
        label="Help & Support"
        onPress={() => navigation.navigate(SCREENS.HELP)}
      />
      <MenuRow
        icon="call-outline"
        label="Contact us"
        onPress={() => navigation.navigate(SCREENS.CONTACT)}
      />

      <View style={styles.divider} />

      <MenuRow
        icon="log-out-outline"
        label="Sign out"
        tintColor={colors.urgent}
        onPress={() => {
          navigation.closeDrawer();
          Alert.alert('Signed out', 'This is a demo build — there is no account to sign out of.');
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
  },
  profile: {
    alignItems: 'flex-start',
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  tagline: {
    color: colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowLabel: {
    color: colors.textPrimary,
  },
});
