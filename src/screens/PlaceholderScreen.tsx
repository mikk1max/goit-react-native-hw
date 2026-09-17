import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type PlaceholderScreenProps = {
  title: string;
  icon: IconName;
  onMenuPress?: () => void;
};

/** Stand-in for tabs outside this assignment's scope (Messages, Profile). */
export function PlaceholderScreen({ title, icon, onMenuPress }: PlaceholderScreenProps) {
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <Header title={title} onMenuPress={onMenuPress} />
      <View style={styles.body}>
        <Ionicons name={icon} size={40} color={themeColors.textPlaceholder} />
        <Text style={[typography.bodyM, { color: themeColors.textPlaceholder }]}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
