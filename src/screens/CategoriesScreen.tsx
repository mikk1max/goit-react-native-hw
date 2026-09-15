import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { SearchBar } from '@/components/SearchBar';
import { useFloatingTabBarClearance } from '@/components/TabBar';
import { categories } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors, spacing, typography } from '@/theme';

export function CategoriesScreen() {
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const tabBarClearance = useFloatingTabBarClearance();
  const [query, setQuery] = useState('');

  return (
    <View style={styles.screen}>
      <Header title="Categories" onBackPress={() => {}} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarClearance }]}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search categories" />

          <Text style={[typography.sectionTitle, styles.sectionTitle]}>All categories</Text>

          <View style={styles.grid}>
            {categories.map((category) => (
              <View key={category.id} style={{ width: cardWidth }}>
                <ListItem title={category.label} leftIcon="heart" showChevron onPress={() => {}} />
              </View>
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
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
