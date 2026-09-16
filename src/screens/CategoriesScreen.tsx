import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/routers';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { SearchBar } from '@/components/SearchBar';
import { TradeIcon } from '@/components/TradeIcon';
import { categories } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { SCREENS } from '@/navigation/screens';
import type { CategoriesStackParamList } from '@/navigation/types';
import { useTabBarLayout } from '@/navigation/useTabBarLayout';
import { colors, spacing, typography } from '@/theme';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CategoriesStackParamList>>();
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const { bottomClearance } = useTabBarLayout();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = categories.filter((category) =>
    category.label.toLowerCase().includes(normalizedQuery),
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomClearance + spacing.xl },
        ]}
      >
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search categories" />

          <Text style={[typography.sectionTitle, styles.sectionTitle]}>All categories</Text>

          {filteredCategories.length === 0 ? (
            <Text style={[typography.bodyM, styles.emptyState]}>
              No categories match your search.
            </Text>
          ) : (
            <View style={styles.grid}>
              {filteredCategories.map((category) => (
                <View key={category.id} style={{ width: cardWidth }}>
                  <ListItem
                    title={category.label}
                    leftIcon={<TradeIcon name={category.icon} color={colors.textSecondary} />}
                    showChevron
                    onPress={() =>
                      navigation.navigate(SCREENS.CATEGORY_DETAILS, {
                        categoryId: category.id,
                        categoryLabel: category.label,
                      })
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Header
        title="Categories"
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
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
  },
  sectionTitle: {
    color: colors.text,
  },
  emptyState: {
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
