import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

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
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
      <Ionicons name="search" size={16} color={themeColors.textPlaceholder} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textPlaceholder}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        style={[styles.input, { color: themeColors.textPrimary }]}
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
  },
});
