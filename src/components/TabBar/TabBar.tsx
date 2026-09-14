import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/theme';

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

export function TabBar({ items, activeKey, onChange }: TabBarProps) {
  // Extra padding for the iOS home indicator; Android's inset is enough alone.
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.surfaceMedium,
    backgroundColor: colors.white,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
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
