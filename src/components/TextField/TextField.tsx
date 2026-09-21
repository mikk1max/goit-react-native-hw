import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import type { TextInput as RNTextInput, TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';
import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  /** Shown under the field in the urgent-accent color, and outlines the border to match — a form's own inline validation, not a toast. */
  error?: string | null;
  /** Optional icon or button slot on the right edge of the input. */
  rightElement?: ReactNode;
};

/**
 * Modern Liquid Glass text-input component with consistent metrics and styling.
 */
export const TextField = forwardRef<RNTextInput, TextFieldProps>(function TextField(
  { label, error, rightElement, ...inputProps },
  ref,
) {
  const { colors: themeColors } = useTheme();
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={[typography.bodyS, { color: themeColors.textMuted }]}>{label}</Text>
      <GlassSurface
        style={[
          styles.inputWrap,
          {
            backgroundColor: themeColors.surface,
            borderColor: hasError ? themeColors.urgent : themeColors.borderLight,
          },
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={themeColors.textPlaceholder}
          style={[
            styles.input,
            {
              color: themeColors.textPrimary,
            },
          ]}
          {...inputProps}
        />
        {rightElement}
      </GlassSurface>
      {hasError ? (
        <Text style={[typography.bodyS, { color: themeColors.urgent }]}>{error}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
  inputWrap: {
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: typography.bodyM.fontFamily,
    fontSize: typography.bodyM.fontSize,
    paddingVertical: 0,
  },
});
