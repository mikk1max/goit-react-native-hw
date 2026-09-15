import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onSubmitEditing,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={16} color={colors.textPlaceholder} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: typography.bodyM.fontFamily,
    fontSize: typography.bodyM.fontSize,
    // No explicit lineHeight here: unlike a plain Text, a TextInput clips a
    // custom font's descenders (g, y, p) when lineHeight is forced tighter
    // than its real glyph metrics — letting it size the line naturally avoids it.
    color: colors.textPrimary,
  },
});
