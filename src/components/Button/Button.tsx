import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary';
type IconName = ComponentProps<typeof Ionicons>['name'];

export type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  /** Ionicons glyph rendered before the label, e.g. "cart" for a "Buy" button. */
  icon?: IconName;
  /**
   * Overrides the brand blue — e.g. colors.urgent for the "Urgent request"
   * module, where blue (this app's "book calmly" color everywhere else)
   * would undercut the sense of urgency.
   */
  tintColor?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  tintColor = colors.primary,
  disabled = false,
  loading = false,
  fullWidth = true,
}: ButtonProps) {
  const isSecondary = variant === 'secondary';
  const isDisabled = disabled || loading;
  const foregroundColor = isSecondary ? tintColor : colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isSecondary
          ? [styles.secondary, { borderColor: tintColor }]
          : [styles.primary, { backgroundColor: tintColor, shadowColor: tintColor }],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={16} color={foregroundColor} /> : null}
          <Text style={[typography.actionM, { color: foregroundColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  primary: {
    // iOS shadow vs Android elevation, per Platform.select. shadowColor is
    // set inline per-instance (tintColor), the rest is constant.
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
