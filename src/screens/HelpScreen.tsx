import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header, useFloatingHeaderClearance } from '@/components/Header';
import { useTheme } from '@/context/ThemeContext';
import { SCREENS } from '@/navigation/screens';
import type { RootDrawerParamList } from '@/navigation/types';
import { spacing, typography } from '@/theme';

const FAQS = [
  {
    question: 'How fast can a pro arrive?',
    answer: 'Urgent requests are matched with a pro who can typically arrive within 30 minutes.',
  },
  {
    question: 'How is pricing calculated?',
    answer:
      'Each pro lists their own diagnostic-visit and hourly rates on their profile before you book.',
  },
  {
    question: 'Can I reschedule a booking?',
    answer: 'Yes — open the booking from the Bookings tab and pick a new day from the calendar.',
  },
];

/** Reached only from the Drawer, not pushed on a stack — "back" returns to the Main tabs directly. */
export function HelpScreen() {
  const navigation = useNavigation<NavigationProp<RootDrawerParamList>>();
  const headerClearance = useFloatingHeaderClearance();
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: themeColors.white }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.content, { paddingTop: headerClearance }]}>
          {FAQS.map((faq) => (
            <View key={faq.question} style={styles.item}>
              <Text style={[typography.sectionTitle, { color: themeColors.text }]}>
                {faq.question}
              </Text>
              <Text style={[typography.bodyM, { color: themeColors.textMuted }]}>{faq.answer}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Header title="Help & Support" onBackPress={() => navigation.navigate(SCREENS.MAIN)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  item: {
    gap: spacing.xxs,
  },
});
