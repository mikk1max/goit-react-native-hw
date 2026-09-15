import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
const INDICATOR_INSET = spacing.xs;
const SLIDE_DURATION = 220;

/** How much bottom padding a screen needs so content doesn't scroll under the floating bar. */
export function useFloatingTabBarClearance() {
  const insets = useSafeAreaInsets();
  return insets.bottom + BOTTOM_OFFSET + BAR_HEIGHT + spacing.md;
}

/**
 * A compact Liquid Glass capsule that hugs its own content and floats,
 * centered, above the screen — not a bar stretched edge to edge. The active
 * tab is a single indicator that slides between tabs instead of a highlight
 * popping in and out on each press.
 */
export function TabBar({ items, activeKey, onChange }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const hasMeasured = useRef(false);
  const layouts = useRef<Record<string, { x: number; width: number }>>({}).current;

  const moveIndicatorTo = (key: string, animated: boolean) => {
    const layout = layouts[key];
    if (!layout) return;
    if (animated) {
      indicatorX.value = withTiming(layout.x, { duration: SLIDE_DURATION });
      indicatorWidth.value = withTiming(layout.width, { duration: SLIDE_DURATION });
    } else {
      indicatorX.value = layout.x;
      indicatorWidth.value = layout.width;
    }
  };

  const handleTabLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    layouts[key] = { x, width };
    if (key === activeKey && !hasMeasured.current) {
      moveIndicatorTo(key, false);
      hasMeasured.current = true;
    }
  };

  useEffect(() => {
    if (hasMeasured.current) {
      moveIndicatorTo(activeKey, true);
    }
    // moveIndicatorTo closes over shared values that don't need to retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View
      style={[styles.floatingLayer, { bottom: insets.bottom + BOTTOM_OFFSET }]}
      pointerEvents="box-none"
    >
      <GlassSurface style={styles.pill} glassEffectStyle="regular" isInteractive>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {items.map((item) => (
          <TabBarButton
            key={item.key}
            item={item}
            isActive={item.key === activeKey}
            onPress={() => onChange(item.key)}
            onLayout={(event) => handleTabLayout(item.key, event)}
          />
        ))}
      </GlassSurface>
    </View>
  );
}

type TabBarButtonProps = {
  item: TabBarItem;
  isActive: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

/** Its own component so the press bounce is a per-tab Reanimated shared value, not shared state. */
function TabBarButton({ item, isActive, onPress, onLayout }: TabBarButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    }
    // `scale` is a stable Reanimated shared value, not a reactive dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onLayout={onLayout}
      style={styles.tab}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isActive ? item.activeIcon : item.icon}
          size={20}
          color={isActive ? colors.primary : colors.textMuted}
        />
      </Animated.View>
      <Text style={[typography.actionS, isActive ? styles.activeLabel : styles.label]}>
        {item.label}
      </Text>
    </Pressable>
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
  indicator: {
    position: 'absolute',
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
    left: 0,
    borderRadius: radii.sm,
    backgroundColor: colors.primaryLightest,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  label: {
    color: colors.textMuted,
  },
  activeLabel: {
    color: colors.textPrimary,
  },
});
