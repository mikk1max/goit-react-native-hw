import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CategoryList } from '@/components/CategoryList';
import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { ProCard } from '@/components/ProCard';
import { SearchBar } from '@/components/SearchBar';
import { useFloatingTabBarClearance } from '@/components/TabBar';
import { categories, recommendedPros } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { colors, radii, spacing, typography } from '@/theme';

export function HomeScreen() {
  const { contentWidth, cardWidth } = useResponsiveLayout();
  const headerClearance = useFloatingHeaderClearance();
  const tabBarClearance = useFloatingTabBarClearance();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarClearance }]}
      >
        <View style={[styles.content, { width: contentWidth, paddingTop: headerClearance }]}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search for a pro or service"
          />

          <View style={styles.urgentCard}>
            <View style={styles.urgentIcon}>
              <Ionicons name="heart" size={20} color={colors.primary} />
            </View>
            <View style={styles.urgentText}>
              <Text style={[typography.h4, styles.urgentTitle]}>Urgent request</Text>
              <Text style={[typography.bodyS, styles.urgentSubtitle]}>
                A pro arrives in about 30 minutes
              </Text>
            </View>
            <Button title="Book now" variant="secondary" fullWidth={false} />
          </View>

          <CategoryList
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />

          <Text style={[typography.sectionTitle, styles.sectionTitle]}>Recommended pros</Text>

          <View style={styles.grid}>
            {recommendedPros.map((pro) => (
              <View key={pro.id} style={{ width: cardWidth }}>
                <ProCard name={pro.name} role={pro.role} rating={pro.rating} onPress={() => {}} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Header title="FixIt" rightElement={<Avatar />} />
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
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  urgentIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentText: {
    flex: 1,
    gap: spacing.xxs,
  },
  urgentTitle: {
    color: colors.textPrimary,
  },
  urgentSubtitle: {
    color: colors.textMuted,
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
