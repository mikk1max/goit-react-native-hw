import Ionicons from '@expo/vector-icons/Ionicons';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Header, useFloatingHeaderClearance } from '@/components/Header';
import type { ThemePreference } from '@/context/ThemeContext';
import { useTheme } from '@/context/ThemeContext';
import { SCREENS } from '@/navigation/screens';
import type { RootDrawerParamList } from '@/navigation/types';
import { radii, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

/** Context API demo — a Drawer-only screen, like Help/Contact, for picking ThemeContext's preference. */
export function AppearanceScreen() {
  const navigation = useNavigation<NavigationProp<RootDrawerParamList>>();
  const headerClearance = useFloatingHeaderClearance();
  const { themePreference, setThemePreference, colors: themeColors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <View style={[styles.content, { paddingTop: headerClearance }]}>
        {OPTIONS.map((option) => {
          const selected = option.value === themePreference;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setThemePreference(option.value)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? themeColors.surface : 'transparent' },
              ]}
            >
              <Ionicons name={option.icon} size={20} color={themeColors.textPrimary} />
              <Text style={[typography.bodyM, styles.label, { color: themeColors.textPrimary }]}>
                {option.label}
              </Text>
              {selected ? (
                <Ionicons name="checkmark" size={20} color={themeColors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Header title="Appearance" onBackPress={() => navigation.navigate(SCREENS.MAIN)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
  },
  label: {
    flex: 1,
  },
});
