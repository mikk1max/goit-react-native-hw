import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

/** Fixed content height of the pill (vertical padding + icon + gap + label). */
const BAR_HEIGHT = 60;
const BOTTOM_OFFSET = spacing.sm;

/** How much bottom padding a screen needs so content doesn't scroll under the floating bar. */
export function useFloatingTabBarClearance() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BOTTOM_OFFSET + BAR_HEIGHT + spacing.md;
}

/**
 * A compact Liquid Glass capsule that hugs its own content and floats,
 * centered, above the screen — not a bar stretched edge to edge.
 */
export function TabBar({ items, activeKey, onChange }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.floatingLayer, { bottom: insets.bottom + BOTTOM_OFFSET }]}
      pointerEvents="box-none"
    >
      <GlassSurface style={styles.pill} glassEffectStyle="regular" isInteractive>
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(item.key)}
              style={[styles.tab, isActive && styles.activeTab]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  floatingLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    borderRadius: radii.round,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
    ...shadows.raised,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  activeTab: {
    backgroundColor: colors.primaryLightest,
  },
  label: {
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.textPrimary,
  },
});
