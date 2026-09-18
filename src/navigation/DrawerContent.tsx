import Ionicons from '@expo/vector-icons/Ionicons';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

import { SCREENS } from './screens';

type IconName = ComponentProps<typeof Ionicons>['name'];

type MenuRowProps = {
  icon: IconName;
  label: string;
  tintColor: string;
  pressedBackgroundColor: string;
  onPress: () => void;
};

function MenuRow({ icon, label, tintColor, pressedBackgroundColor, onPress }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: pressedBackgroundColor }]}
    >
      <Ionicons name={icon} size={20} color={tintColor} />
      <Text style={[typography.bodyM, { color: tintColor }]}>{label}</Text>
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
  // Context API demo: ThemeContext's resolved `colors` recolors this Drawer
  // (and everything else) — the preference itself lives on its own
  // Appearance screen, not a switch here.
  const { colors: themeColors } = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: themeColors.white }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.profile}>
        <Avatar size="lg" />
        <Text style={[typography.h4, styles.name, { color: themeColors.textPrimary }]}>Guest</Text>
        <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>Welcome to FixIt</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: themeColors.borderLight }]} />

      <MenuRow
        icon="help-circle-outline"
        label="Help & Support"
        tintColor={themeColors.textPrimary}
        pressedBackgroundColor={themeColors.surface}
        onPress={() => navigation.navigate(SCREENS.HELP)}
      />
      <MenuRow
        icon="call-outline"
        label="Contact us"
        tintColor={themeColors.textPrimary}
        pressedBackgroundColor={themeColors.surface}
        onPress={() => navigation.navigate(SCREENS.CONTACT)}
      />

      <View style={[styles.divider, { backgroundColor: themeColors.borderLight }]} />

      <MenuRow
        icon="color-palette-outline"
        label="Appearance"
        tintColor={themeColors.textPrimary}
        pressedBackgroundColor={themeColors.surface}
        onPress={() => navigation.navigate(SCREENS.APPEARANCE)}
      />

      <View style={[styles.divider, { backgroundColor: themeColors.borderLight }]} />

      <MenuRow
        icon="log-out-outline"
        label="Sign out"
        tintColor={themeColors.urgent}
        pressedBackgroundColor={themeColors.surface}
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
    marginTop: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
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
});
