import { FlatList, StyleSheet } from 'react-native';

import { Tag } from '@/components/Tag';
import type { TradeIconName } from '@/components/TradeIcon';
import { spacing } from '@/theme';

export type Category = {
  id: string;
  label: string;
  icon: TradeIconName;
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
          icon={item.icon}
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
