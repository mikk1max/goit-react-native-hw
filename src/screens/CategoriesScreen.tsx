import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Header } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { SearchBar } from '@/components/SearchBar';
import { categories } from '@/data/mockData';
import { colors, spacing, typography } from '@/theme';

const MAX_CONTENT_WIDTH = 480;

export function CategoriesScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);

  return (
    <View style={styles.screen}>
      <Header title="Categories" onBackPress={() => {}} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { width: contentWidth }]}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search categories" />

          <Text style={[typography.sectionTitle, styles.sectionTitle]}>All categories</Text>

          <View>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                title={category.label}
                leftIcon="heart"
                showChevron
                onPress={() => {}}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
  },
});
