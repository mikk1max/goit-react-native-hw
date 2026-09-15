import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/GlassSurface';
import { colors, radii, shadows, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type TabBarItem = {
  key: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

export type TabBarProps = {
  items: TabBarItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

/** Fixed content height of the bar (icon + gap + label), safe-area padding excluded. */
const BAR_HEIGHT = 62;
const BOTTOM_OFFSET = spacing.sm;

/** How much bottom padding a screen needs so content doesn't scroll under the floating bar. */
export function useFloatingTabBarClearance() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BOTTOM_OFFSET + BAR_HEIGHT + spacing.md;
}

/** Floats as a Liquid Glass pill above scrollable content, iOS 26 tab-bar style. */
export function TabBar({ items, activeKey, onChange }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <GlassSurface
      style={[styles.container, { bottom: insets.bottom + BOTTOM_OFFSET }]}
      glassEffectStyle="regular"
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.key)}
            style={styles.tab}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={20}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[typography.actionS, isActive ? styles.activeLabel : styles.label]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.raised,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  label: {
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.textPrimary,
  },
});
