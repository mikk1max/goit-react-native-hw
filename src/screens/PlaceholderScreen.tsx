import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { colors, spacing, typography } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type PlaceholderScreenProps = {
  title: string;
  icon: IconName;
  onMenuPress?: () => void;
};

/** Stand-in for tabs outside this assignment's scope (Messages, Profile). */
export function PlaceholderScreen({ title, icon, onMenuPress }: PlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <Header title={title} onMenuPress={onMenuPress} />
      <View style={styles.body}>
        <Ionicons name={icon} size={40} color={colors.textPlaceholder} />
        <Text style={[typography.bodyM, styles.text]}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    color: colors.textPlaceholder,
  },
});
