import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/context/ThemeContext';
import { radii, spacing, typography } from '@/theme';

const CHECK_ICON_SIZE = 56;

export type BookingSuccessModalProps = {
  visible: boolean;
  providerName: string;
  dateLabel: string;
  onClose: () => void;
};

/**
 * Confirmation screen shown right after "Book appointment" succeeds — a
 * modal rather than a pushed route, since there's nothing to navigate back
 * from (closing it just returns to the same profile), matching the
 * Figma Checkout flow's "booking confirmed" step.
 */
export function BookingSuccessModal({
  visible,
  providerName,
  dateLabel,
  onClose,
}: BookingSuccessModalProps) {
  const { colors: themeColors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: themeColors.white }]}>
          <View style={[styles.iconCircle, { backgroundColor: themeColors.primaryLightest }]}>
            <Ionicons name="checkmark-circle" size={CHECK_ICON_SIZE} color={themeColors.primary} />
          </View>
          <Text style={[typography.h4, styles.title, { color: themeColors.textPrimary }]}>
            Appointment booked!
          </Text>
          <Text style={[typography.bodyM, styles.subtitle, { color: themeColors.textMuted }]}>
            {providerName} · {dateLabel}
          </Text>
          <Button title="Done" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 32, 36, 0.4)',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
