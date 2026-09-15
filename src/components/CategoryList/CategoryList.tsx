import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Tag } from '@/components/Tag';
import { spacing } from '@/theme';

export type Category = {
  id: string;
  label: string;
  /** Not rendered by Tag itself (the Figma component is text-only) — used by
   *  CategoriesScreen's ListItem, which does have a left-icon slot. Stored
   *  once here so both screens agree on the same category → icon mapping. */
  icon: ComponentProps<typeof Ionicons>['name'];
};

export type CategoryListProps = {
  categories: Category[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export function CategoryList({ categories, selectedId, onSelect }: CategoryListProps) {
  return (
    <FlatList
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Tag
          label={item.label}
          selected={item.id === selectedId}
          onPress={() => onSelect?.(item.id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xs,
  },
});
